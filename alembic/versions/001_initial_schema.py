"""Initial schema with all 15 tables

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    user_role_enum = postgresql.ENUM(
        'ATHLETE', 'MENTOR', 'GUARDIAN', 'ADMIN', 'SAFETY_OFFICER', 'COACH', 'SPONSOR',
        name='userrole',
        create_type=False
    )
    user_role_enum.create(op.get_bind(), checkfirst=True)

    achievement_level_enum = postgresql.ENUM(
        'SCHOOL', 'DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL',
        name='achievementlevel',
        create_type=False
    )
    achievement_level_enum.create(op.get_bind(), checkfirst=True)

    saved_status_enum = postgresql.ENUM(
        'SAVED', 'APPLYING', 'SUBMITTED', 'SHORTLISTED', 'APPROVED', 'REJECTED',
        name='savedstatus',
        create_type=False
    )
    saved_status_enum.create(op.get_bind(), checkfirst=True)

    request_status_enum = postgresql.ENUM(
        'PENDING', 'PENDING_GUARDIAN', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED',
        name='requeststatus',
        create_type=False
    )
    request_status_enum.create(op.get_bind(), checkfirst=True)

    mentorship_mode_enum = postgresql.ENUM(
        'ONLINE', 'OFFLINE', 'GROUP', 'CAREER_GUIDANCE', 'TRIAL_PREP', 'SCHOLARSHIP_GUIDANCE',
        name='mentorshipmode',
        create_type=False
    )
    mentorship_mode_enum.create(op.get_bind(), checkfirst=True)

    report_category_enum = postgresql.ENUM(
        'HARASSMENT', 'INAPPROPRIATE_LANGUAGE', 'FRAUD', 'UNSAFE_MEETING', 'PRESSURE',
        'DISCRIMINATION', 'MISUSE_CONTENT', 'FINANCIAL_MISCONDUCT', 'PRIVACY_VIOLATION', 'OTHER',
        name='reportcategory',
        create_type=False
    )
    report_category_enum.create(op.get_bind(), checkfirst=True)

    report_severity_enum = postgresql.ENUM(
        'NORMAL', 'URGENT', 'EMERGENCY',
        name='reportseverity',
        create_type=False
    )
    report_severity_enum.create(op.get_bind(), checkfirst=True)

    report_status_enum = postgresql.ENUM(
        'SUBMITTED', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'DISMISSED',
        name='reportstatus',
        create_type=False
    )
    report_status_enum.create(op.get_bind(), checkfirst=True)

    opportunity_type_enum = postgresql.ENUM(
        'TOURNAMENT', 'TRIAL', 'CAMP', 'GOVERNMENT_SCHEME', 'ACADEMY', 'SCHOLARSHIP', 'INTERNSHIP', 'JOB',
        name='opportunitytype',
        create_type=False
    )
    opportunity_type_enum.create(op.get_bind(), checkfirst=True)

    training_category_enum = postgresql.ENUM(
        'SKILLS_DRILLS', 'TECHNIQUE', 'NUTRITION', 'INJURY_PREVENTION', 'MENTAL_WELLNESS',
        'MENSTRUAL_HEALTH', 'TIME_MANAGEMENT', 'CAREER_PLANNING', 'TRIAL_PREP', 'SCHOLARSHIP_GUIDANCE',
        'STRENGTH_CONDITIONING', 'RECOVERY',
        name='trainingcategory',
        create_type=False
    )
    training_category_enum.create(op.get_bind(), checkfirst=True)

    sponsor_type_enum = postgresql.ENUM(
        'EQUIPMENT', 'TRAVEL', 'TOURNAMENT_FEE', 'GRANT', 'TRAINING', 'NUTRITION', 'EDUCATION', 'GENERAL',
        name='sponsortype',
        create_type=False
    )
    sponsor_type_enum.create(op.get_bind(), checkfirst=True)

    sponsor_status_enum = postgresql.ENUM(
        'OPEN', 'CLOSED', 'UNDER_REVIEW', 'AWARDED',
        name='sponsorstatus',
        create_type=False
    )
    sponsor_status_enum.create(op.get_bind(), checkfirst=True)

    notification_type_enum = postgresql.ENUM(
        'MENTORSHIP', 'SCHOLARSHIP', 'REPORT', 'VERIFICATION', 'REWARD', 'ADMIN', 'SYSTEM', 'CHAT', 'OPPORTUNITY', 'TRAINING', 'REMINDER',
        name='notificationtype',
        create_type=False
    )
    notification_type_enum.create(op.get_bind(), checkfirst=True)

    guardian_relation_enum = postgresql.ENUM(
        'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'GRANDFATHER', 'GRANDMOTHER', 'GUARDIAN', 'OTHER',
        name='guardianrelation',
        create_type=False
    )
    guardian_relation_enum.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('phone_number', sa.String(20), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', user_role_enum, nullable=False, default='ATHLETE'),
        sa.Column('verified', sa.Boolean, nullable=False, default=False),
        sa.Column('is_active', sa.Boolean, nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_phone_number', 'users', ['phone_number'])

    # Create athlete_profiles table
    op.create_table(
        'athlete_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('sport', sa.String(100), nullable=False),
        sa.Column('position', sa.String(100)),
        sa.Column('district', sa.String(100), nullable=False),
        sa.Column('state', sa.String(100), nullable=False),
        sa.Column('level', achievement_level_enum, nullable=False, default='DISTRICT'),
        sa.Column('achievements', postgresql.JSON),
        sa.Column('video_urls', postgresql.JSON),
        sa.Column('goals', sa.Text),
        sa.Column('bio', sa.Text),
        sa.Column('preferred_language', sa.String(10), default='en'),
        sa.Column('guardian_name', sa.String(255)),
        sa.Column('guardian_phone', sa.String(20)),
        sa.Column('profile_completion', sa.Integer, default=0),
        sa.Column('visibility_settings', postgresql.JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_athlete_profiles_user_id', 'athlete_profiles', ['user_id'])
    op.create_index('ix_athlete_profiles_sport', 'athlete_profiles', ['sport'])
    op.create_index('ix_athlete_profiles_district', 'athlete_profiles', ['district'])
    op.create_index('ix_athlete_profiles_state', 'athlete_profiles', ['state'])

    # Create mentor_profiles table
    op.create_table(
        'mentor_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('expertise', sa.String(255), nullable=False),
        sa.Column('experience_years', sa.Integer, nullable=False, default=0, server_default='0'),
        sa.Column('verified', sa.Boolean, nullable=False, default=False, server_default='false'),
        sa.Column('certifications', postgresql.JSON),
        sa.Column('languages', postgresql.JSON),
        sa.Column('trust_score', sa.Float, default=0.0, server_default='0.0'),
        sa.Column('availability', sa.String(50)),
        sa.Column('training_philosophy', sa.Text),
        sa.Column('bio', sa.Text),
        sa.Column('district', sa.String(100)),
        sa.Column('state', sa.String(100)),
        sa.Column('code_of_conduct_accepted', sa.Boolean, nullable=False, default=False, server_default='false'),
        sa.Column('response_time', sa.String(50)),
        sa.Column('total_reviews', sa.Integer, default=0, server_default='0'),
        sa.Column('average_rating', sa.Float, default=0.0, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_mentor_profiles_user_id', 'mentor_profiles', ['user_id'])
    op.create_index('ix_mentor_profiles_expertise', 'mentor_profiles', ['expertise'])
    op.create_index('ix_mentor_profiles_verified', 'mentor_profiles', ['verified'])

    # Create guardian_profiles table
    op.create_table(
        'guardian_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('relation', guardian_relation_enum, nullable=False),
        sa.Column('occupation', sa.String(100)),
        sa.Column('address', sa.String(500)),
        sa.Column('verified', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create scholarships table
    op.create_table(
        'scholarships',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('provider', sa.String(255), nullable=False),
        sa.Column('amount', sa.String(100), nullable=False),
        sa.Column('eligibility', sa.Text),
        sa.Column('deadline', sa.Date, nullable=False),
        sa.Column('state', sa.String(100)),
        sa.Column('sport', sa.String(100)),
        sa.Column('girls_only', sa.Boolean, default=False),
        sa.Column('hostel_support', sa.Boolean, default=False),
        sa.Column('application_mode', sa.String(100)),
        sa.Column('description', sa.Text),
        sa.Column('application_url', sa.String(500)),
        sa.Column('documents_required', postgresql.JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_scholarships_name', 'scholarships', ['name'])
    op.create_index('ix_scholarships_deadline', 'scholarships', ['deadline'])
    op.create_index('ix_scholarships_state', 'scholarships', ['state'])
    op.create_index('ix_scholarships_sport', 'scholarships', ['sport'])
    op.create_index('ix_scholarships_girls_only', 'scholarships', ['girls_only'])

    # Create saved_scholarships table
    op.create_table(
        'saved_scholarships',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scholarship_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('scholarships.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', saved_status_enum, default='SAVED'),
        sa.Column('notes', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_saved_scholarships_user_id', 'saved_scholarships', ['user_id'])
    op.create_index('ix_saved_scholarships_scholarship_id', 'saved_scholarships', ['scholarship_id'])
    op.create_unique_constraint('uq_saved_scholarships_user_scholarship', 'saved_scholarships', ['user_id', 'scholarship_id'])

    # Create mentorship_requests table
    op.create_table(
        'mentorship_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('athlete_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mentor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('guardian_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('status', request_status_enum, default='PENDING'),
        sa.Column('goal', sa.String(255)),
        sa.Column('mode', mentorship_mode_enum, default='ONLINE'),
        sa.Column('message', sa.Text),
        sa.Column('guardian_approved', sa.Boolean, default=False),
        sa.Column('guardian_approval_date', sa.DateTime(timezone=True)),
        sa.Column('start_date', sa.DateTime(timezone=True)),
        sa.Column('end_date', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_mentorship_requests_athlete_id', 'mentorship_requests', ['athlete_id'])
    op.create_index('ix_mentorship_requests_mentor_id', 'mentorship_requests', ['mentor_id'])
    op.create_index('ix_mentorship_requests_status', 'mentorship_requests', ['status'])

    # Create safety_reports table
    op.create_table(
        'safety_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('ticket_id', sa.String(50), unique=True, nullable=False),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('reported_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('category', report_category_enum, nullable=False),
        sa.Column('severity', report_severity_enum, default='NORMAL'),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('anonymous', sa.Boolean, default=False),
        sa.Column('evidence_urls', postgresql.JSON),
        sa.Column('status', report_status_enum, default='SUBMITTED'),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('resolution_notes', sa.Text),
        sa.Column('resolved_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_safety_reports_ticket_id', 'safety_reports', ['ticket_id'])
    op.create_index('ix_safety_reports_reporter_id', 'safety_reports', ['reporter_id'])
    op.create_index('ix_safety_reports_reported_id', 'safety_reports', ['reported_id'])
    op.create_index('ix_safety_reports_status', 'safety_reports', ['status'])
    op.create_index('ix_safety_reports_category', 'safety_reports', ['category'])
    op.create_index('ix_safety_reports_severity', 'safety_reports', ['severity'])

    # Create report_timeline table
    op.create_table(
        'report_timeline',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('report_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('safety_reports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('action', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('performed_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_report_timeline_report_id', 'report_timeline', ['report_id'])

    # Create colleges table
    op.create_table(
        'colleges',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('location', sa.String(255), nullable=False),
        sa.Column('state', sa.String(100)),
        sa.Column('sports_quota', sa.Boolean, default=False),
        sa.Column('fee_concession', sa.String(100)),
        sa.Column('hostel', sa.Boolean, default=False),
        sa.Column('supported_sports', postgresql.JSON),
        sa.Column('quota_rules', sa.Text),
        sa.Column('required_achievement_level', sa.String(100)),
        sa.Column('academic_streams', postgresql.JSON),
        sa.Column('last_date', sa.Date),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('contact_phone', sa.String(20)),
        sa.Column('website', sa.String(500)),
        sa.Column('description', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_colleges_name', 'colleges', ['name'])
    op.create_index('ix_colleges_location', 'colleges', ['location'])
    op.create_index('ix_colleges_state', 'colleges', ['state'])
    op.create_index('ix_colleges_sports_quota', 'colleges', ['sports_quota'])

    # Create opportunities table
    op.create_table(
        'opportunities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('type', opportunity_type_enum, nullable=False),
        sa.Column('organization', sa.String(255), nullable=False),
        sa.Column('location', sa.String(255)),
        sa.Column('state', sa.String(100)),
        sa.Column('deadline', sa.Date),
        sa.Column('description', sa.Text),
        sa.Column('sport', sa.String(100)),
        sa.Column('eligibility', sa.Text),
        sa.Column('women_focused', sa.Boolean, default=False),
        sa.Column('age_range', sa.String(50)),
        sa.Column('application_url', sa.String(500)),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('contact_phone', sa.String(20)),
        sa.Column('benefits', postgresql.JSON),
        sa.Column('requirements', postgresql.JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_opportunities_title', 'opportunities', ['title'])
    op.create_index('ix_opportunities_type', 'opportunities', ['type'])
    op.create_index('ix_opportunities_state', 'opportunities', ['state'])
    op.create_index('ix_opportunities_sport', 'opportunities', ['sport'])
    op.create_index('ix_opportunities_women_focused', 'opportunities', ['women_focused'])

    # Create training_resources table
    op.create_table(
        'training_resources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('category', training_category_enum, nullable=False),
        sa.Column('content', sa.Text),
        sa.Column('video_url', sa.String(500)),
        sa.Column('thumbnail_url', sa.String(500)),
        sa.Column('author', sa.String(255)),
        sa.Column('duration', sa.String(50)),
        sa.Column('sport', sa.String(100)),
        sa.Column('difficulty_level', sa.String(50)),
        sa.Column('tags', postgresql.JSON),
        sa.Column('view_count', sa.Integer, default=0),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('is_published', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_training_resources_title', 'training_resources', ['title'])
    op.create_index('ix_training_resources_category', 'training_resources', ['category'])
    op.create_index('ix_training_resources_sport', 'training_resources', ['sport'])

    # Create sponsor_programs table
    op.create_table(
        'sponsor_programs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('sponsor_name', sa.String(255), nullable=False),
        sa.Column('type', sponsor_type_enum, nullable=False),
        sa.Column('amount', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('eligibility', sa.Text),
        sa.Column('application_process', sa.Text),
        sa.Column('deadline', sa.DateTime(timezone=True)),
        sa.Column('status', sponsor_status_enum, default='OPEN'),
        sa.Column('max_recipients', sa.Integer),
        sa.Column('current_recipients', sa.Integer, default=0),
        sa.Column('sport', sa.String(100)),
        sa.Column('state', sa.String(100)),
        sa.Column('women_focused', sa.Boolean, default=False),
        sa.Column('application_url', sa.String(500)),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('requirements', postgresql.JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_sponsor_programs_name', 'sponsor_programs', ['name'])
    op.create_index('ix_sponsor_programs_type', 'sponsor_programs', ['type'])
    op.create_index('ix_sponsor_programs_status', 'sponsor_programs', ['status'])
    op.create_index('ix_sponsor_programs_sport', 'sponsor_programs', ['sport'])
    op.create_index('ix_sponsor_programs_state', 'sponsor_programs', ['state'])

    # Create mentor_reviews table
    op.create_table(
        'mentor_reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('mentor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('athlete_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mentorship_request_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('mentorship_requests.id', ondelete='SET NULL')),
        sa.Column('respectful', sa.Integer, nullable=False),
        sa.Column('helpful', sa.Integer, nullable=False),
        sa.Column('knowledgeable', sa.Integer, nullable=False),
        sa.Column('safe_communication', sa.Integer, nullable=False),
        sa.Column('punctual', sa.Integer, nullable=False),
        sa.Column('overall_rating', sa.Float, nullable=False),
        sa.Column('comment', sa.Text),
        sa.Column('private_safety_flag', sa.Boolean, default=False),
        sa.Column('safety_concern', sa.Text),
        sa.Column('moderated', sa.Boolean, default=False),
        sa.Column('visible', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_mentor_reviews_mentor_id', 'mentor_reviews', ['mentor_id'])
    op.create_index('ix_mentor_reviews_athlete_id', 'mentor_reviews', ['athlete_id'])
    op.create_unique_constraint('uq_mentor_reviews_mentor_athlete', 'mentor_reviews', ['mentor_id', 'athlete_id'])

    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', notification_type_enum, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('read', sa.Boolean, default=False),
        sa.Column('action_url', sa.String(500)),
        sa.Column('action_text', sa.String(100)),
        sa.Column('metadata', postgresql.JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_type', 'notifications', ['type'])
    op.create_index('ix_notifications_read', 'notifications', ['read'])

    # Create chat_threads table
    op.create_table(
        'chat_threads',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('athlete_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mentor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mentorship_request_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('mentorship_requests.id', ondelete='SET NULL')),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('is_blocked', sa.Boolean, default=False),
        sa.Column('blocked_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('last_message_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_chat_threads_athlete_id', 'chat_threads', ['athlete_id'])
    op.create_index('ix_chat_threads_mentor_id', 'chat_threads', ['mentor_id'])
    op.create_index('ix_chat_threads_mentorship_request_id', 'chat_threads', ['mentorship_request_id'])
    op.create_unique_constraint('uq_chat_threads_athlete_mentor', 'chat_threads', ['athlete_id', 'mentor_id'])

    # Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('thread_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chat_threads.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('read', sa.Boolean, default=False),
        sa.Column('read_at', sa.DateTime(timezone=True)),
        sa.Column('attachment_urls', postgresql.JSON),
        sa.Column('moderation_flag', sa.Boolean, default=False),
        sa.Column('moderation_reason', sa.String(255)),
        sa.Column('moderated_at', sa.DateTime(timezone=True)),
        sa.Column('guardian_visible', sa.Boolean, default=True),
        sa.Column('is_system_message', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_chat_messages_thread_id', 'chat_messages', ['thread_id'])
    op.create_index('ix_chat_messages_sender_id', 'chat_messages', ['sender_id'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('chat_messages')
    op.drop_table('chat_threads')
    op.drop_table('notifications')
    op.drop_table('mentor_reviews')
    op.drop_table('sponsor_programs')
    op.drop_table('training_resources')
    op.drop_table('opportunities')
    op.drop_table('colleges')
    op.drop_table('report_timeline')
    op.drop_table('safety_reports')
    op.drop_table('mentorship_requests')
    op.drop_table('saved_scholarships')
    op.drop_table('scholarships')
    op.drop_table('guardian_profiles')
    op.drop_table('mentor_profiles')
    op.drop_table('athlete_profiles')
    op.drop_table('users')

    # Drop enum types
    op.execute("DROP TYPE IF EXISTS guardianrelation")
    op.execute("DROP TYPE IF EXISTS notificationtype")
    op.execute("DROP TYPE IF EXISTS sponsorstatus")
    op.execute("DROP TYPE IF EXISTS sponsortype")
    op.execute("DROP TYPE IF EXISTS trainingcategory")
    op.execute("DROP TYPE IF EXISTS opportunitytype")
    op.execute("DROP TYPE IF EXISTS reportstatus")
    op.execute("DROP TYPE IF EXISTS reportseverity")
    op.execute("DROP TYPE IF EXISTS reportcategory")
    op.execute("DROP TYPE IF EXISTS mentorshipmode")
    op.execute("DROP TYPE IF EXISTS requeststatus")
    op.execute("DROP TYPE IF EXISTS savedstatus")
    op.execute("DROP TYPE IF EXISTS achievementlevel")
    op.execute("DROP TYPE IF EXISTS userrole")
