from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.models import User, Milestone, Scan
import datetime

async def award_points(user_id: int, points: int, db: AsyncSession):
    """Update user points and eco-score."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user:
        user.points = (user.points or 0) + points
        # Update eco-score based on points (simple mapping for now)
        # Max score 100
        new_score = min(100, (user.points // 100)) 
        user.eco_score = new_score
        await db.commit()
    return user

async def check_and_record_milestones(user_id: int, db: AsyncSession):
    """Check for new achievements and record them."""
    # 1. Check total scans
    scan_count_stmt = select(Scan).where(Scan.user_id == user_id)
    scan_results = await db.execute(scan_count_stmt)
    scans = scan_results.scalars().all()
    num_scans = len(scans)
    
    milestone_added = False
    
    if num_scans == 1:
        milestone_added = await add_milestone_if_new(user_id, "First Scan Explorer", "Completed your very first storage scan!", db)
    elif num_scans == 5:
        milestone_added = await add_milestone_if_new(user_id, "Consistent Cleaner", "Completed 5 storage scans.", db)
        
    # 2. Check total points
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    if user and user.points >= 1000:
        milestone_added = await add_milestone_if_new(user_id, "Eco Warrior", "Reached 1,000 Eco Points!", db)
        
    if milestone_added:
        await db.commit()

async def add_milestone_if_new(user_id: int, title: str, description: str, db: AsyncSession):
    """Add a milestone only if the user hasn't achieved it yet."""
    existing = await db.execute(select(Milestone).where(Milestone.user_id == user_id, Milestone.title == title))
    if not existing.scalars().first():
        new_m = Milestone(
            user_id=user_id,
            title=title,
            description=description,
            achieved_at=datetime.datetime.utcnow()
        )
        db.add(new_m)
        return True
    return False
