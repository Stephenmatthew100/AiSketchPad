The current `write_to_json` function is blocking. To make the saving to JSON asynchronous, you'll need to use an asynchronous task queue like Celery or Redis Queue.  Here's how you can modify your code using Celery:

**1. Install Celery and related packages:**

```bash
pip install celery django-celery-beat redis
```

**2. Configure Celery:**

* Create a `celery.py` file (e.g., in your app's directory):

```python
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')  # Replace your_project_name

app = Celery('your_project_name')  # Replace your_project_name
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

* Add Celery settings to your `settings.py`:

```python
CELERY_BROKER_URL = 'redis://localhost:6379/0'  # Or your Redis URL
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'  # Or your Redis URL
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler' #For scheduled tasks

# Add this if you use timezones.  Adjust to your needs
CELERY_TIMEZONE = 'UTC'

# Optional: increase task concurrency if needed. Adjust according to server resources.
CELERY_WORKER_CONCURRENCY = 4
```

* Run Celery worker and beat:

```bash
celery -A your_project_name worker -l info
celery -A your_project_name beat -l info
```


**3. Modify your `utils.py`:**

```python
import json
from celery import shared_task  # Import shared_task

@shared_task
def async_write_to_json(data_to_save, results_to_save):
    """Asynchronously writes data to a JSON file."""
    try:
        #Your existing logic to write to JSON file here
        # ... (Access your file path from settings) ...
        with open(settings.JSON_FILE_PATH, 'w') as f:
            json.dump({'data': data_to_save, 'results': results_to_save}, f, indent=4)
    except Exception as e:
        print(f"Error writing to JSON: {e}")
```

**4. Update your `views.py`:**

```python
from .utils import async_write_to_json # Import the async task

@csrf_exempt
def ask_follow_up(request):
    # ... (Your existing code) ...

    try:
        # ... (Your existing code) ...

        # Call the asynchronous task
        async_write_to_json.delay({'context': context, 'question': question}, {'answer': follow_up_answer})

        return JsonResponse({
            'answer': follow_up_answer,
            'status': 'success'
        })
    except Exception as e:
        return JsonResponse({'message': str(e), 'status': 'error'}, status=500)
    # ... (Your existing code) ...

```

**5.  Add `JSON_FILE_PATH` to your `settings.py`:**

```python
JSON_FILE_PATH = '/path/to/your/file.json' #Replace with your desired path
```

Now, when `ask_follow_up` is called,  `async_write_to_json` will be added to the Celery queue and executed asynchronously by a worker, without blocking the main request-response cycle.  The user will receive the answer immediately, and the JSON writing happens in the background.  Remember to replace `"your_project_name"` and `/path/to/your/file.json` with your actual project and file path.


Remember to handle potential exceptions within the `async_write_to_json` function appropriately, perhaps logging errors instead of letting them silently fail.  Consider adding error handling and retry mechanisms in a production environment.  Also, ensure that your Redis server is running.