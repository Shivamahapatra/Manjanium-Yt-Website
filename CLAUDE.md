@AGENTS.md

**CRITICAL WORKFLOW RULES - YOU MUST FOLLOW THESE STEPS FOR EVERY TASK:**

Whenever you complete a task or make changes to the codebase, you are strictly required to execute the following steps in order before ending your turn:

1. **Verify with Build**: Run `npm run build` to verify there are no compilation or type errors. Fix any errors before proceeding.
2. **Update Context Tracker**: You MUST update `ping.txt` in the root directory to log your work. 
   - **DO NOT** delete or overwrite the historical context in `ping.txt`. 
   - Append a new section at the very bottom using this exact format:
     ```
     --- Update: [Brief Title] (YYYY-MM-DDTHH:MM:SS+TZ) ---
     Changes made:
     - [Bullet points of files created, modified, or deleted]
     - [Brief explanation of what was changed]
     Context:
     - [Any relevant state, open issues, or things the next agent should know]
     ```
3. **Commit and Push**: Once the build passes and `ping.txt` is updated, run the following commands to save and push your work:
   - `git add .`
   - `git commit -m "feat/fix/docs: [Brief description of changes]"`
   - `git push`

Failure to run the build, overwriting historical context in `ping.txt`, or forgetting to push are unacceptable.
