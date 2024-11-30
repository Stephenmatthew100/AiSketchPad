from django.http import Http404
from django.shortcuts import render

def view_404(request):
    raise Http404("Page not found")

def index(request):
    return render(request, 'index.html')