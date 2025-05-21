import { GameController } from './gamecontroller';
import { Game } from './game';

describe('GameController', () => {
  let mockGameDb: any;
  let controller: GameController;
  const baseRow = {
    id: 1,
    player1: 'user1',
    player2: 'user2',
    state: JSON.stringify([
      [Game.EMPTY, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY],
      [Game.EMPTY, Game.EMPTY, Game.EMPTY]
    ]),
    turn: Game.PLAYER_1,
    winner: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockGameDb = {
      findActiveGamesForUser: jest.fn(),
      findAvailableGameToJoin: jest.fn(),
      joinGame: jest.fn(),
      getGameRow: jest.fn(),
      createGame: jest.fn(),
      updateGameState: jest.fn(),
      setGameWinner: jest.fn(),
    };
    controller = new GameController(mockGameDb);
  });

  describe('findGame', () => {
    it('returns active game if exists', async () => {
      mockGameDb.findActiveGamesForUser.mockResolvedValue([baseRow]);
      const game = await controller.findGame('user1');
      expect(game).toBeInstanceOf(Game);
      expect(game.player1).toBe('user1');
    });

    it('joins available game if found', async () => {
      mockGameDb.findActiveGamesForUser.mockResolvedValue([]);
      mockGameDb.findAvailableGameToJoin.mockResolvedValue([{ id: 2 }]);
      mockGameDb.joinGame.mockResolvedValue();
      mockGameDb.getGameRow.mockResolvedValue({ ...baseRow, id: 2 });
      const game = await controller.findGame('user3');
      expect(mockGameDb.joinGame).toHaveBeenCalledWith('user3', 2);
      expect(game.id).toBe(2);
    });

    it('creates new game if none available', async () => {
      mockGameDb.findActiveGamesForUser.mockResolvedValue([]);
      mockGameDb.findAvailableGameToJoin.mockResolvedValue([]);
      mockGameDb.createGame.mockResolvedValue(3);
      mockGameDb.getGameRow.mockResolvedValue({ ...baseRow, id: 3 });
      const game = await controller.findGame('user4');
      expect(mockGameDb.createGame).toHaveBeenCalled();
      expect(game.id).toBe(3);
    });
  });

  describe('getGame', () => {
    it('throws if missing userId or gameId', async () => {
      await expect(controller.getGame('', '1')).rejects.toThrow('Missing userid or gameId');
      await expect(controller.getGame('user1', '')).rejects.toThrow('Missing userid or gameId');
    });

    it('throws if game not found', async () => {
      mockGameDb.getGameRow.mockResolvedValue(undefined);
      await expect(controller.getGame('user1', '99')).rejects.toThrow('Game not found for id: 99');
    });

    it('joins as player2 if slot open', async () => {
      const row = { ...baseRow, player2: null };
      mockGameDb.getGameRow.mockResolvedValueOnce(row).mockResolvedValueOnce({ ...row, player2: 'user2' });
      mockGameDb.joinGame.mockResolvedValue();
      const game = await controller.getGame('user2', '1');
      expect(mockGameDb.joinGame).toHaveBeenCalledWith('user2', '1');
      expect(game.player2).toBe('user2');
    });
  });

  describe('makeMove', () => {
    it('throws if user not in game', async () => {
      const row = { ...baseRow, player1: 'other', player2: 'someone' };
      mockGameDb.getGameRow.mockResolvedValue(row);
      await expect(controller.makeMove('user1', '1', 0, 0)).rejects.toThrow('Game not found for id: 1');
    });

    it('throws if not user turn', async () => {
      mockGameDb.getGameRow.mockResolvedValue(baseRow);
      await expect(controller.makeMove('user2', '1', 0, 0)).rejects.toThrow('Not your turn');
    });

    it('throws if cell occupied', async () => {
      const row = { ...baseRow, state: JSON.stringify([
        [Game.PLAYER_1, Game.EMPTY, Game.EMPTY],
        [Game.EMPTY, Game.EMPTY, Game.EMPTY],
        [Game.EMPTY, Game.EMPTY, Game.EMPTY]
      ]) };
      mockGameDb.getGameRow.mockResolvedValue(row);
      await expect(controller.makeMove('user1', '1', 0, 0)).rejects.toThrow('Cell already occupied');
    });

    it('makes a valid move and updates state', async () => {
      mockGameDb.getGameRow.mockResolvedValueOnce(baseRow).mockResolvedValueOnce({ ...baseRow, state: JSON.stringify([
        [Game.PLAYER_1, Game.EMPTY, Game.EMPTY],
        [Game.EMPTY, Game.EMPTY, Game.EMPTY],
        [Game.EMPTY, Game.EMPTY, Game.EMPTY]
      ]), turn: Game.PLAYER_2 });
      mockGameDb.updateGameState.mockResolvedValue();
      mockGameDb.setGameWinner.mockResolvedValue();
      const game = await controller.makeMove('user1', '1', 0, 0);
      expect(mockGameDb.updateGameState).toHaveBeenCalled();
      expect(game.state[0][0]).toBe(Game.PLAYER_1);
      expect(game.turn).toBe(Game.PLAYER_2);
    });
  });
}); 