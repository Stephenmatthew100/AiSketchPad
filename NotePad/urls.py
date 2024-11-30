app_name = 'NotePad'

from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotePad, name='notepad'),
    path('upload/', views.process_image, name='process_image'),
    path('ask_follow_up/', views.ask_follow_up, name='ask_follow_up')
]