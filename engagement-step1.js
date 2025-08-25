// engagement.js - Step 1: Break down the complex condition

function checkEngagement(session) {
  // Extract each condition with a clear, descriptive name
  const hasGoodAttendance = session.attendees > 50;
  const hasHighRating = session.rating > 4.0;
  const hasActiveParticipation = session.questions > 3;
  
  // Now this reads like English
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

console.log("Clear conditions result:", checkEngagement(workshop));