import asyncio
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database.repositories.reminders_repo import reminders_repo
from app.database.repositories.notifications_repo import notifications_repo
from app.core.logging import logger

class ReminderScheduler:
    """Lightweight background scheduler for checking and triggering reminders."""
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False

    def start(self):
        if not self.is_running:
            self.scheduler.add_job(
                self.check_due_reminders,
                "interval",
                seconds=15,
                id="reminder_check_job",
                replace_existing=True
            )
            self.scheduler.start()
            self.is_running = True
            logger.info("Reminder background scheduler started (15s polling interval).")

    def stop(self):
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Reminder background scheduler stopped.")

    async def check_due_reminders(self):
        try:
            due_reminders = reminders_repo.get_pending_due()
            for rem in due_reminders:
                reminders_repo.mark_triggered(rem["id"])
                # Create in-app notification
                msg = f"Reminder Alert: {rem['title']}"
                notifications_repo.create(user_id=rem["user_id"], message=msg)
                logger.info(f"Triggered reminder: '{rem['title']}' for user {rem['user_id'][:8]}")
        except Exception as e:
            logger.error(f"Error checking due reminders: {e}")

reminder_scheduler = ReminderScheduler()
