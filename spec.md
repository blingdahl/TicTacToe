# Backend SWE Take Home Interview | BE-001-T3

### Backend Systems Challenge: Build a Distributed Grid-Based Game Engine

Your task is to design and implement a backend API that manages gameplay for a grid-based scoring game. This challenge will test your skills in:

- Backend API design
- SQL data modeling
- Handling concurrent user interactions
- Structuring maintainable test suites
- Thinking about distributed gameplay systems

> 🕰️ Time Expectation: Please spend no more than 4 hours on this challenge. We're evaluating your approach and thought process rather than production-ready polish.

## Core Requirements

1. **Game Rules**
   - Players take turns marking a shared 3×3 grid with their unique integer ID.
   - A move is invalid if it's not the player's turn or the cell is already occupied.
   - A player wins by occupying a full row, column, or diagonal with their ID.
   - The game ends in a draw if all cells are filled with no winner.
2. **System Behavior**
   - Multiple game sessions can run concurrently.
   - Each session starts empty and becomes immutable after moves.
   - Once two players have joined a session, it begins.
3. **Required Functionality**
   - Create and join game sessions
   - Submit and validate moves
   - Detect and declare win/draw outcomes
   - Track per-player performance
   - Leaderboard: return top 3 users by win count or **efficiency**
     - _Efficiency = average number of moves per win (lower is better)_
4. **Simulation Script**
   - Simulate multiple concurrent games across multiple players
   - Assert correctness of game outcomes
   - Output top 3 players by win ratio after N games

## Technical Expectations

- Your API may be implemented in any language/framework you're comfortable with
- Include simple setup instructions (README or inline comments)
- You're encouraged to demonstrate:
  - Test coverage
  - Thoughtfulness in error handling
  - Clarity in code structure
  - Sensible modeling of game state and user interactions

## Submission

Please share your code (GitHub, zip, etc.) and README or inline instructions for running the API and the simulation script.

> Note: We're less focused on completeness than we are on how you reason through API design, concurrency, and extensibility.