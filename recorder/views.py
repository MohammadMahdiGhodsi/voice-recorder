from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Sound


def index(request):
    return render(request, 'recorder/index.html')


@csrf_exempt
def upload(request):
    if request.method == 'POST' and request.FILES.get('audio'):
        audio = request.FILES['audio']
        title = request.POST.get('title', 'صدای جدید')
        sound = Sound.objects.create(title=title, audio=audio)
        return JsonResponse({'id': sound.id, 'title': sound.title, 'url': sound.audio.url})
    return JsonResponse({'error': 'فایلی ارسال نشد'}, status=400)


def list_sounds(request):
    sounds = Sound.objects.all().order_by('-created_at')
    data = [{'id': s.id, 'title': s.title, 'url': s.audio.url, 'created_at': s.created_at.strftime('%Y-%m-%d %H:%M')}
            for s in sounds]
    return JsonResponse({'sounds': data})


@csrf_exempt
def delete_sound(request, sound_id):
    if request.method == 'DELETE':
        try:
            sound = Sound.objects.get(id=sound_id)
            sound.audio.delete()
            sound.delete()
            return JsonResponse({'ok': True})
        except Sound.DoesNotExist:
            return JsonResponse({'error': 'پیدا نشد'}, status=404)
    return JsonResponse({'error': 'روش نامعتبر'}, status=405)
