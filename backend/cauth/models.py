from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, username, password, is_superuser):
        if not email:
            raise ValueError('User must have email')
        if not username:
            raise ValueError('User must have username')

        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.set_password(password)
        user.is_superuser = is_superuser
        user.save(using=self._db)
        return user

    def create_user(self, email, username, password=None):
        return self._create_user(email, username, password, False)

    def create_superuser(self, email, username, password):
        return self._create_user(email, username, password, True)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=60, unique=True)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = UserManager()

    def as_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
        }

    @property
    def is_staff(self):
        return self.is_superuser
