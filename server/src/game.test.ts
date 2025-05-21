// @jest-environment node
import { describe, it, expect } from '@jest/globals';
import { Game } from './game';

// Jest test suite for Game class

describe('Game', () => {
  const baseRow = {
    id: 1,
    player1: 'user1',
    player2: 'user2',
    state: JSON.stringify([
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]),
    turn: Game.PLAYER_1,
    winner: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  it('should initialize from row and serialize/deserialize state', () => {
    const game = Game.fromRow(baseRow);
    expect(game.player1).toBe('user1');
    expect(game.player2).toBe('user2');
    expect(game.state).toEqual([
      [Game.EMPTY, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY]
    ]);
    expect(Game.serializeGameState(game.state)).toBe(baseRow.state);
  });

  it('should allow a valid move and toggle turn', () => {
    const game = Game.fromRow(baseRow);
    expect(game.turn).toBe('player1');
    game.makeMove(0, 0, 'user1');
    expect(game.state[0][0]).toBe('player1');
    expect(game.turn).toBe('player2');
  });

  it('should not allow move if not player turn', () => {
    const game = Game.fromRow(baseRow);
    expect(() => game.makeMove(0, 0, 'user2')).toThrow('Not your turn');
  });

  it('should not allow move if cell is occupied', () => {
    const row = { ...baseRow, state: JSON.stringify([
      [Game.PLAYER_1, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY]
    ]) };
    const game = Game.fromRow(row);
    expect(() => game.makeMove(0, 0, 'user1')).toThrow('Cell already occupied');
  });

  it('should detect a winner (row)', () => {
    const row = { ...baseRow, state: JSON.stringify([
      [Game.PLAYER_1, Game.PLAYER_1, Game.PLAYER_1],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY]
    ]) };
    const game = Game.fromRow(row);
    expect(game.getWinner()).toBe(Game.PLAYER_1);
  });

  it('should detect a winner (column)', () => {
    const row = { ...baseRow, state: JSON.stringify([
      [Game.PLAYER_2, Game.EMPTY, Game.EMPTY],
      [Game.PLAYER_2, Game.EMPTY, Game.EMPTY],
      [Game.PLAYER_2, Game.EMPTY, Game.EMPTY]
    ]) };
    const game = Game.fromRow(row);
    expect(game.getWinner()).toBe(Game.PLAYER_2);
  });

  it('should detect a winner (diagonal)', () => {
    const row = { ...baseRow, state: JSON.stringify([
      [Game.PLAYER_1, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.PLAYER_1, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.PLAYER_1]
    ]) };
    const game = Game.fromRow(row);
    expect(game.getWinner()).toBe(Game.PLAYER_1);
  });

  it('should detect a draw', () => {
    const row = { ...baseRow, state: JSON.stringify([
      [Game.PLAYER_1, Game.PLAYER_2, Game.PLAYER_1],
      [Game.PLAYER_2, Game.PLAYER_1, Game.PLAYER_2],
      [Game.PLAYER_2, Game.PLAYER_1, Game.PLAYER_2]
    ]) };
    const game = Game.fromRow(row);
    expect(game.getWinner()).toBe('draw');
  });
}); 