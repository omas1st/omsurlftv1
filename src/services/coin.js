// src/services/coin.js
import api from './api';

const coinService = {
  // Get user coin balance
  getBalance: async () => {
    try {
      const response = await api.get('/coins/balance');
      return {
        success: true,
        balance: response.data.balance,
        history: response.data.history || []
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coin balance'
      };
    }
  },

  // Get coin history
  getHistory: async (params = {}) => {
    try {
      const response = await api.get('/coins/history', { params });
      return {
        success: true,
        history: response.data.history,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coin history'
      };
    }
  },

  // Earn coins (referral, task completion, etc.)
  earnCoins: async (source, amount, metadata = {}) => {
    try {
      const response = await api.post('/coins/earn', {
        source,
        amount,
        metadata
      });
      return {
        success: true,
        newBalance: response.data.newBalance,
        transaction: response.data.transaction,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to earn coins'
      };
    }
  },

  // Spend coins
  spendCoins: async (purpose, amount, metadata = {}) => {
    try {
      const response = await api.post('/coins/spend', {
        purpose,
        amount,
        metadata
      });
      return {
        success: true,
        newBalance: response.data.newBalance,
        transaction: response.data.transaction,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to spend coins'
      };
    }
  },

  // Transfer coins to another user
  transferCoins: async (toUserId, amount, note = '') => {
    try {
      const response = await api.post('/coins/transfer', {
        toUserId,
        amount,
        note
      });
      return {
        success: true,
        newBalance: response.data.newBalance,
        transaction: response.data.transaction,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to transfer coins'
      };
    }
  },

  // Get available rewards
  getRewards: async () => {
    try {
      const response = await api.get('/coins/rewards');
      return {
        success: true,
        rewards: response.data.rewards
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch rewards'
      };
    }
  },

  // Redeem reward
  redeemReward: async (rewardId) => {
    try {
      const response = await api.post('/coins/redeem', { rewardId });
      return {
        success: true,
        newBalance: response.data.newBalance,
        reward: response.data.reward,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to redeem reward'
      };
    }
  },

  // Get referral code
  getReferralCode: async () => {
    try {
      const response = await api.get('/coins/referral');
      return {
        success: true,
        code: response.data.code,
        url: response.data.url,
        stats: response.data.stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch referral code'
      };
    }
  },

  // Generate new referral code
  generateReferralCode: async () => {
    try {
      const response = await api.post('/coins/referral/generate');
      return {
        success: true,
        code: response.data.code,
        url: response.data.url
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate referral code'
      };
    }
  },

  // Get referral stats
  getReferralStats: async () => {
    try {
      const response = await api.get('/coins/referral/stats');
      return {
        success: true,
        stats: response.data.stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch referral stats'
      };
    }
  },

  // Claim referral bonus
  claimReferralBonus: async (referralCode) => {
    try {
      const response = await api.post('/coins/referral/claim', { referralCode });
      return {
        success: true,
        newBalance: response.data.newBalance,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to claim referral bonus'
      };
    }
  },

  // Get daily tasks
  getDailyTasks: async () => {
    try {
      const response = await api.get('/coins/tasks/daily');
      return {
        success: true,
        tasks: response.data.tasks
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch daily tasks'
      };
    }
  },

  // Complete task
  completeTask: async (taskId) => {
    try {
      const response = await api.post('/coins/tasks/complete', { taskId });
      return {
        success: true,
        newBalance: response.data.newBalance,
        task: response.data.task,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete task'
      };
    }
  },

  // Get achievement badges
  getAchievements: async () => {
    try {
      const response = await api.get('/coins/achievements');
      return {
        success: true,
        achievements: response.data.achievements
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch achievements'
      };
    }
  },

  // Claim achievement
  claimAchievement: async (achievementId) => {
    try {
      const response = await api.post('/coins/achievements/claim', { achievementId });
      return {
        success: true,
        newBalance: response.data.newBalance,
        achievement: response.data.achievement,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to claim achievement'
      };
    }
  },

  // Get premium subscription plans
  getPremiumPlans: async () => {
    try {
      const response = await api.get('/coins/premium/plans');
      return {
        success: true,
        plans: response.data.plans
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch premium plans'
      };
    }
  },

  // Subscribe to premium plan
  subscribePremium: async (planId, paymentMethod = 'coins') => {
    try {
      const response = await api.post('/coins/premium/subscribe', {
        planId,
        paymentMethod
      });
      return {
        success: true,
        subscription: response.data.subscription,
        newBalance: response.data.newBalance,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to subscribe to premium'
      };
    }
  },

  // Get current subscription
  getCurrentSubscription: async () => {
    try {
      const response = await api.get('/coins/premium/subscription');
      return {
        success: true,
        subscription: response.data.subscription
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch subscription'
      };
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.post('/coins/premium/cancel');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel subscription'
      };
    }
  },

  // Get coin packages for purchase
  getCoinPackages: async () => {
    try {
      const response = await api.get('/coins/packages');
      return {
        success: true,
        packages: response.data.packages
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coin packages'
      };
    }
  },

  // Purchase coins
  purchaseCoins: async (packageId, paymentMethod) => {
    try {
      const response = await api.post('/coins/purchase', {
        packageId,
        paymentMethod
      });
      return {
        success: true,
        transaction: response.data.transaction,
        paymentUrl: response.data.paymentUrl,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to purchase coins'
      };
    }
  },

  // Verify payment
  verifyPayment: async (paymentId) => {
    try {
      const response = await api.post('/coins/verify-payment', { paymentId });
      return {
        success: true,
        verified: response.data.verified,
        newBalance: response.data.newBalance,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment'
      };
    }
  },

  // Get transaction by ID
  getTransaction: async (transactionId) => {
    try {
      const response = await api.get(`/coins/transaction/${transactionId}`);
      return {
        success: true,
        transaction: response.data.transaction
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch transaction'
      };
    }
  },

  // Get leaderboard
  getLeaderboard: async (period = 'monthly') => {
    try {
      const response = await api.get('/coins/leaderboard', { params: { period } });
      return {
        success: true,
        leaderboard: response.data.leaderboard,
        userRank: response.data.userRank
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch leaderboard'
      };
    }
  },

  // Get coin value in USD
  getCoinValue: async () => {
    try {
      const response = await api.get('/coins/value');
      return {
        success: true,
        value: response.data.value,
        currency: response.data.currency
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coin value'
      };
    }
  }
};

export default coinService;