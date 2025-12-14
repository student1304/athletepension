"""
Celery application configuration.
"""
from celery import Celery
from app.config import settings

# Create Celery instance
celery_app = Celery(
    "athletepension",
    broker=settings.celery_broker,
    backend=settings.celery_backend,
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# Optional: Auto-discover tasks in app.tasks module
# celery_app.autodiscover_tasks(['app.tasks'])

@celery_app.task(name="app.celery_app.test_task")
def test_task():
    """Test task to verify Celery is working."""
    return "Celery is working!"