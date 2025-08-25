// engagement.js - EventFlow engagement checker (needs refactoring)

function checkEngagement(session) {
  // This condition is hard to read - what do these numbers mean?
  if (session.attendees > 50 && session.rating > 4.0 && session.questions > 3) {
    return "high";
  }
  return "low";
}

// Test with sample session data
const workshop = {
  attendees: 60,
  rating: 4.2,
  questions: 5
};

console.log("Original result:", checkEngagement(workshop));