from django.db import models

class Sound(models.Model):
    title = models.CharField(max_length=100, default='صدای جدید')
    audio = models.FileField(upload_to='sounds/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title