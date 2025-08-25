# Code Refactoring Screencast - Complete Recording Guide
## C5 M3 L3 1 - Code Refactoring

---

## Pre-Recording Setup (10 minutes before)

### 1. Create and Switch to Demo Branch

```bash
# Navigate to project
cd "/Volumes/[C] Windows 11/eventflow/eventflow-dashboard"

# Save any current work
git add .
git stash  # Saves any uncommitted changes

# Create and switch to demo branch
git checkout -b refactoring-demo

# Verify you're on the demo branch
git branch  # Should show * refactoring-demo
```

### 2. Create the engagement.js File

Create `engagement.js` in the project root directory with this **initial messy version**:

```javascript
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
```

### 3. Create Backup Files (For Quick Switching During Recording)

Create these backup files to quickly copy/paste during recording:

**engagement-step1.js** (Broken down conditions):
```javascript
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
```

**engagement-step2.js** (With constants):
```javascript
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
```

### 4. VS Code Setup

```bash
# Open VS Code
code .
```

**Initial Setup:**
- Open `engagement.js` in the editor
- Set font size to 16-18px (Ctrl/Cmd + to zoom in)
- Close Explorer panel to maximize code space
- Set color theme if needed (preferably a light theme for recording)
- Turn off minimap (View → Show Minimap)

**Terminal Setup:**
- Open integrated terminal (Terminal → New Terminal)
- Position terminal at bottom, taking up about 25% of screen height
- Clear terminal: `clear`
- Test the initial file: `node engagement.js`
- Verify output: "Original result: high"

### 5. Commit Demo Setup (Optional but Recommended)

```bash
# This saves your demo state
git add .
git commit -m "Demo setup for refactoring screencast"
```

---

## Recording Timeline with Exact Actions

### Segment 1: Introduction (0:00 - 0:24)
**Audio**: *"Welcome to Code Refactoring... By the end of this video, you'll be able to explain refactoring strategies..."*

**Actions**:
- **0:00-0:06** - Show title slide or VS Code with engagement.js open
- **0:07-0:24** - Hold on objective if using slides, or keep VS Code visible
- No interaction needed

---

### Segment 2: Show Initial Code (0:24 - 0:54)
**Audio**: *"Refactoring means improving code structure... Let me show you some EventFlow code that works but needs cleaning up..."*

**Actions**:
- **0:24** - VS Code should be open with engagement.js
- **0:30** - If not already visible, open engagement.js
- **0:38** - Slowly scroll to show the full function
- **0:42** - Use mouse to highlight the complex if statement (line 5)
- **0:48** - Point cursor at the numbers (50, 4.0, 3)
- **0:52** - Hover over different parts of the condition

---

### Segment 3: Pattern 1 - Break Down Conditions (0:54 - 2:12)
**Audio**: *"Pattern 1: Break Down Complex Conditions... That if statement is hard to read..."*

**Actions**:
- **0:54** - Keep if statement highlighted
- **1:05** - Click at the beginning of line 4 (before the if statement)
- **1:08** - Press Enter twice to create space
- **1:10** - Start typing the extracted variables SLOWLY:

**Type each line with deliberate pauses:**
- **1:12** - Type: `  // Extract each condition with a clear, descriptive name`
- **1:18** - Press Enter
- **1:20** - Type: `  const hasGoodAttendance = session.attendees > 50;`
- **1:30** - Press Enter
- **1:32** - Type: `  const hasHighRating = session.rating > 4.0;`
- **1:42** - Press Enter
- **1:44** - Type: `  const hasActiveParticipation = session.questions > 3;`
- **1:54** - Press Enter twice
- **1:56** - Update the if statement comment: `  // Now this reads like English`
- **2:02** - Modify the if condition to use the new variables:
  - Select the old condition inside the parentheses
  - **2:05** - Type: `hasGoodAttendance && hasHighRating && hasActiveParticipation`
- **2:10** - Save file (Ctrl/Cmd + S)

---

### Segment 4: Pattern 2 - Replace Magic Numbers (2:12 - 3:12)
**Audio**: *"Pattern 2: Replace Magic Numbers... But what does fifty mean?..."*

**Actions**:
- **2:12** - Scroll to top of file
- **2:15** - Point cursor at the number 50 in the code
- **2:18** - Point at 4.0
- **2:20** - Point at 3
- **2:25** - Click at line 1 (very top of file)
- **2:27** - Press Enter a few times to create space
- **2:30** - Add comment and constants at the top:

**Type each line deliberately:**
- **2:32** - Type: `// Named constants make the business rules crystal clear`
- **2:38** - Press Enter
- **2:40** - Type: `const MIN_ATTENDEES = 50;`
- **2:46** - Press Enter
- **2:48** - Type: `const MIN_RATING = 4.0;`
- **2:54** - Press Enter
- **2:56** - Type: `const MIN_QUESTIONS = 3;`
- **3:02** - Press Enter twice

**Update the conditions to use constants:**
- **3:05** - Scroll down to the conditions
- **3:07** - Replace `50` with `MIN_ATTENDEES`
- **3:09** - Replace `4.0` with `MIN_RATING`
- **3:10** - Replace `3` with `MIN_QUESTIONS`
- **3:11** - Save file (Ctrl/Cmd + S)

---

### Segment 5: Test Refactored Code (3:12 - 3:30)
**Audio**: *"Let's test our refactored code to make sure it produces exactly the same results..."*

**Actions**:
- **3:12** - Click in terminal (or open if closed)
- **3:14** - Clear terminal: type `clear` and press Enter
- **3:16** - Type: `node engagement.js`
- **3:18** - Press Enter
- **3:20** - Output shows: "Original result: high" (or similar)
- **3:22** - Update the console.log text in the code to match current state
- **3:25** - Change `"Original result:"` to `"Final refactored result:"`
- **3:27** - Save and run again
- **3:29** - Point to the output showing it works the same

---

### Segment 6: Professional Benefits (3:30 - 4:18)
**Audio**: *"Why This Matters Professionally... These simple changes have huge professional benefits..."*

**Actions**:
- **3:30** - Keep code visible
- **3:35** - Scroll to show the constants at the top
- **3:45** - Demonstrate changing a constant:
  - **3:48** - Click on `50` in MIN_ATTENDEES
  - **3:50** - Change it to `75`
  - **3:52** - Type comment: `// Easy to change!`
  - **3:55** - Change back to `50`
  - **3:57** - Remove the comment
- **4:00** - Scroll to show the full refactored function
- **4:10** - Highlight the readable if statement with mouse

---

### Segment 7: When to Refactor (4:18 - 4:48)
**Audio**: *"When to Refactor... Refactor when you're confused by your own code..."*

**Actions**:
- **4:18** - Keep code visible or show slides if available
- **4:30** - If showing code, could highlight complex parts
- **4:40** - Scroll through the clean code
- No specific interactions needed

---

### Segment 8: Apply to EventFlow (4:48 - 5:30)
**Audio**: *"Apply This to EventFlow... Look at your EventFlow code with fresh eyes..."*

**Actions**:
- **4:48** - Could briefly open a real EventFlow component file
- **4:52** - Navigate to `src/components/analytics/AttendanceChart.js`
- **4:55** - Quickly scroll through to show real project code
- **5:00** - Point to any complex conditions or magic numbers if visible
- **5:10** - Return to engagement.js
- **5:20** - Show the final clean version

---

### Segment 9: Summary and Closing (5:30 - 6:00)
**Audio**: *"Remember, refactoring isn't about showing off... We've seen how breaking down complex conditions..."*

**Actions**:
- **5:30** - Show the complete refactored code
- **5:35** - Scroll to show all three constants at top
- **5:40** - Scroll to show the clean function
- **5:45** - Highlight the readable if statement one more time
- **5:50** - Hold on the clean code view
- **5:58** - End on code or title slide

---

## Quick Reference - Key Code Transitions

### Initial Messy Code
```javascript
if (session.attendees > 50 && session.rating > 4.0 && session.questions > 3)
```

### After Pattern 1
```javascript
const hasGoodAttendance = session.attendees > 50;
const hasHighRating = session.rating > 4.0;
const hasActiveParticipation = session.questions > 3;

if (hasGoodAttendance && hasHighRating && hasActiveParticipation)
```

### After Pattern 2
```javascript
const MIN_ATTENDEES = 50;
const MIN_RATING = 4.0;
const MIN_QUESTIONS = 3;

const hasGoodAttendance = session.attendees > MIN_ATTENDEES;
const hasHighRating = session.rating > MIN_RATING;
const hasActiveParticipation = session.questions > MIN_QUESTIONS;
```

---

## Post-Recording Cleanup

```bash
# Return to main branch and delete demo branch
git checkout main
git branch -D refactoring-demo

# Remove the engagement files
rm engagement.js engagement-step1.js engagement-step2.js

# Verify app is back to normal
npm start  # Should show regular EventFlow app
```

---

## Contingency Plans

### If You Type Too Fast
- Use Ctrl/Cmd + Z to undo
- Retype more slowly
- Remember: viewers need to follow along

### If You Make a Typing Error
- Fix it naturally - this shows real coding
- Or use Ctrl/Cmd + Z to undo and retype

### If Terminal Output Is Wrong
- Check that you saved the file (Ctrl/Cmd + S)
- Make sure you're running the correct file: `node engagement.js`

### If You Need to Restart a Section
- You have backup files (engagement-step1.js, engagement-step2.js)
- Can copy content from backup files
- Or use git to reset: `git checkout engagement.js`

---

## Pre-Flight Checklist

- [ ] On `refactoring-demo` branch
- [ ] engagement.js created with initial messy code
- [ ] Backup files created (engagement-step1.js, engagement-step2.js)
- [ ] VS Code open with engagement.js visible
- [ ] Font size set to 16-18px
- [ ] Terminal open and positioned at bottom
- [ ] Initial code runs successfully (`node engagement.js`)
- [ ] Explorer panel closed for more code space
- [ ] Minimap turned off

---

## Typing Speed Guidelines

### SLOW Typing Sections (1-2 characters per second):
- Variable names when first introducing them
- The refactored if condition
- Constant definitions

### NORMAL Typing Sections (3-4 characters per second):
- Comments
- Console.log updates
- Terminal commands

### Can Type Quickly:
- Fixing typos
- Closing brackets/parentheses

---

## Key Success Metrics

✅ **Initial messy code is clearly hard to read**  
✅ **Each refactoring step is shown deliberately**  
✅ **Variable names are typed slowly enough to read**  
✅ **Constants clearly show business rules**  
✅ **Terminal shows code working identically before/after**  
✅ **Final code is obviously more readable**  
✅ **All transitions match audio timing**

---

## Audio Sync Points (Critical Timing)

- **0:38** - "Let me show you some EventFlow code" → Code visible
- **0:54** - "Pattern 1: Break Down Complex Conditions" → Start refactoring
- **2:12** - "Pattern 2: Replace Magic Numbers" → Start adding constants
- **3:12** - "Let's test our refactored code" → Run in terminal
- **4:48** - "Apply This to EventFlow" → Could show real component
- **5:30** - "Remember, refactoring isn't about showing off" → Final code visible

---

*Note: This guide assumes the audio narration has already been recorded. Focus on smooth, deliberate typing and clear visual demonstrations that match the audio timing.*