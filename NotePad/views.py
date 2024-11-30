from django.shortcuts import render
import base64
import json
from io import BytesIO
from django.http import JsonResponse
from PIL import Image
from .utils import analyze_image, write_to_json
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
import google.generativeai as genai

# Create your views here.
def NotePad(request):
    return render(request, 'notepad.html')

@csrf_exempt
def process_image(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_data = base64.b64decode(data['image'].split(",")[1])
            image_bytes = BytesIO(image_data)
            image = Image.open(image_bytes)

            context_input = data.get('dict_of_vars', {}).get('context', '')

            results = analyze_image(image, context_input)

            # Create a response dictionary
            response_data = {
                # 'inputs': {
                #     'img': image,
                #     'context': context_input
                # },
                'message': "Image processed",
                'data': results,
                'status': 'success'
            }
            messages.success(request, 'Done...')
            return JsonResponse(response_data)
        except Exception as e:
            print(e)
            messages.error(request, 'Sorry Something Came Up...')
            return JsonResponse({'message': str(e), 'status': 'error'}, status=400)
    else:
        return JsonResponse({'message': 'Invalid request method', 'status': 'error'}, status=405)
 
# @csrf_exempt
# def ask_follow_up(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             question = data.get('question', '')
#             context = data.get('context', '')
#             image = None

#             if not question:
#                 return JsonResponse({'message': 'No question provided', 'status': 'error'}, status=400)

#             # # Compose prompt for follow-up question
#             # prompt = f"{context} Now, answer the following follow-up question: {question}"

#             # model = genai.GenerativeModel(model_name="gemini-1.5-flash")
#             # response = model.generate_content([prompt])

#             # # Return the response text as the follow-up answer
#             # follow_up_answer = response.text.strip()

#             context_input = f"{context}, now answer the following followup question: {question}"

#             follow_up_answer = analyze_image(None, context_input)

#             return JsonResponse({
#                 'answer': follow_up_answer,
#                 'status': 'success'
#             })
#         except Exception as e:
#             return JsonResponse({'message': str(e), 'status': 'error'}, status=500)
#     else:
#         return JsonResponse({'message': 'Invalid request method', 'status': 'error'}, status=405)

@csrf_exempt
def ask_follow_up(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            question = data.get('question', '')
            context = data.get('context', '')

            if not question:
                return JsonResponse({'message': 'No question provided', 'status': 'error'}, status=400)

            # Compose prompt for follow-up question
            prompt = f"{context} Now, answer the following follow-up question: {question}"

            model = genai.GenerativeModel(model_name="gemini-1.5-flash")
            response = model.generate_content([prompt])

            # Return the response text as the follow-up answer
            follow_up_answer = response.text.strip()

            write_to_json({'context': context, 'question': question}, {'answer': follow_up_answer})

            return JsonResponse({
                'answer': follow_up_answer,
                'status': 'success'
            })
        except Exception as e:
            return JsonResponse({'message': str(e), 'status': 'error'}, status=500)
    else:
        return JsonResponse({'message': 'Invalid request method', 'status': 'error'}, status=405)