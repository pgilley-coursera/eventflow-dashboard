// engagement.js - Step 2: Replace magic numbers with named constants

// Named constants make the business rules crystal clear
const MIN_ATTENDEES = 50;
const MIN_RATING = 4.0;
const MIN_QUESTIONS = 3;

function checkEngagement(session) {
  const hasGoodAttendance = session.attendees > MIN_ATTENDEES;
  const hasHighRating = session.rating > MIN_RATING;
  const hasActiveParticipation = session.questions > MIN_QUESTIONS;
  
  if (hasGoodAttendance && hasHighRating && hasActiveParticipation) {
    return "high";
  }
  return "low";
}

const workshop = {
  attendees: 60,
  rating: 4.2,
  questions: 5
};

console.log("Final refactored result:", checkEngagement(workshop));