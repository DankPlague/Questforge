# Questforge

Questforge is a playful lesson-authoring workspace where teachers create interactive learning quests and students work through them one checkpoint at a time.

## First playable slice

- **Teacher authoring studio:** edit lesson title, subject, grade, and intro; add or remove multiple-choice checkpoints; change answer options and mark the correct answer.
- **Live quest card:** see the student-facing lesson details update as you edit.
- **Student preview:** play the lesson, get answer feedback, track progress, and earn 10 XP for each correct answer.
- **Autosave:** the current lesson is stored in this browser using local storage.
- **Publish validation:** prevents publishing a lesson with missing questions or answers.

## Run locally

This is a dependency-free static app. Open `index.html` in a browser, or serve this directory with any static HTTP server. For example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Current scope

This is a front-end prototype. Lessons are saved locally in the browser; accounts, shared classroom data, server persistence, and real publishing are not connected yet.
