/*
  # Add absences tracking to courses

  1. Changes
    - Add `absences` column to courses table with default value of 0
    
  2. Notes
    - The absences column tracks how many classes the student has missed
    - Default value of 0 ensures existing courses start with no absences
*/

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS absences integer DEFAULT 0;