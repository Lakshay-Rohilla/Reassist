-- Supabase Database Schema for Research Assistant
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Research Queries: Stores each research question submitted
create table if not exists research_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  question text not null,
  status text default 'pending' check (status in ('pending', 'researching', 'completed', 'failed')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Research Reports: Stores the generated research reports
create table if not exists research_reports (
  id uuid primary key default gen_random_uuid(),
  query_id uuid references research_queries on delete cascade not null,
  executive_summary text,
  detailed_findings jsonb, -- Array of section objects
  knowledge_gaps jsonb, -- Array of gap strings
  research_duration int, -- Duration in seconds
  created_at timestamptz default now()
);

-- Citations: Source references for reports
create table if not exists citations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references research_reports on delete cascade not null,
  citation_number int not null,
  source_title text not null,
  url text,
  author text,
  publication_date text,
  source_type text check (source_type in ('article', 'report', 'paper', 'news', 'company')),
  excerpt text
);

-- Saved Reports: User bookmarks
create table if not exists saved_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  report_id uuid references research_reports on delete cascade not null,
  saved_at timestamptz default now(),
  notes text,
  unique(user_id, report_id)
);

-- Follow-up Questions: Questions asked after initial research
create table if not exists follow_up_questions (
  id uuid primary key default gen_random_uuid(),
  parent_query_id uuid references research_queries on delete cascade not null,
  question text not null,
  answer jsonb, -- The follow-up report/response
  created_at timestamptz default now()
);

-- User Preferences: Store user settings
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade unique not null,
  theme text default 'light' check (theme in ('light', 'dark', 'system')),
  default_search_depth text default 'standard' check (default_search_depth in ('quick', 'standard', 'comprehensive')),
  email_notifications boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- INDEXES
-- =====================================================

create index if not exists idx_research_queries_user_id on research_queries(user_id);
create index if not exists idx_research_queries_created_at on research_queries(created_at desc);
create index if not exists idx_research_reports_query_id on research_reports(query_id);
create index if not exists idx_citations_report_id on citations(report_id);
create index if not exists idx_saved_reports_user_id on saved_reports(user_id);
create index if not exists idx_follow_up_questions_parent_id on follow_up_questions(parent_query_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
alter table research_queries enable row level security;
alter table research_reports enable row level security;
alter table citations enable row level security;
alter table saved_reports enable row level security;
alter table follow_up_questions enable row level security;
alter table user_preferences enable row level security;

-- Research Queries: Users can only access their own queries
create policy "Users can view own queries"
  on research_queries for select
  using (auth.uid() = user_id);

create policy "Users can insert own queries"
  on research_queries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own queries"
  on research_queries for update
  using (auth.uid() = user_id);

create policy "Users can delete own queries"
  on research_queries for delete
  using (auth.uid() = user_id);

-- Research Reports: Users can access reports for their queries
create policy "Users can view reports for own queries"
  on research_reports for select
  using (
    exists (
      select 1 from research_queries
      where research_queries.id = research_reports.query_id
      and research_queries.user_id = auth.uid()
    )
  );

create policy "Users can insert reports for own queries"
  on research_reports for insert
  with check (
    exists (
      select 1 from research_queries
      where research_queries.id = query_id
      and research_queries.user_id = auth.uid()
    )
  );

-- Citations: Same access as reports
create policy "Users can view citations for own reports"
  on citations for select
  using (
    exists (
      select 1 from research_reports
      join research_queries on research_queries.id = research_reports.query_id
      where research_reports.id = citations.report_id
      and research_queries.user_id = auth.uid()
    )
  );

create policy "Users can insert citations for own reports"
  on citations for insert
  with check (
    exists (
      select 1 from research_reports
      join research_queries on research_queries.id = research_reports.query_id
      where research_reports.id = report_id
      and research_queries.user_id = auth.uid()
    )
  );

-- Saved Reports: Users can only access their own bookmarks
create policy "Users can view own saved reports"
  on saved_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved reports"
  on saved_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved reports"
  on saved_reports for delete
  using (auth.uid() = user_id);

-- Follow-up Questions: Users can access follow-ups for their queries
create policy "Users can view follow-ups for own queries"
  on follow_up_questions for select
  using (
    exists (
      select 1 from research_queries
      where research_queries.id = follow_up_questions.parent_query_id
      and research_queries.user_id = auth.uid()
    )
  );

create policy "Users can insert follow-ups for own queries"
  on follow_up_questions for insert
  with check (
    exists (
      select 1 from research_queries
      where research_queries.id = parent_query_id
      and research_queries.user_id = auth.uid()
    )
  );

-- User Preferences: Users can only access their own preferences
create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update user_preferences.updated_at on changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for user_preferences
create trigger update_user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at_column();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- You can add any initial/seed data here if needed
