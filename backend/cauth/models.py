from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import UserManager as DjangoManager


class UserManager(DjangoManager):
    def create_user(self, username, email=None, password=None, *args, **kwargs):
        if not username:
            raise ValueError('User must have username')
        if not email:
            raise ValueError('User must have email')

        return super().create_user(username, email=email, password=password, *args, **kwargs)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=60, unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = UserManager()

    def as_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
        }
