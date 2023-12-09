from django.shortcuts import render

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def room(request, roomCode, *args, **kwargs):
    return render(request, 'frontend/room.html')