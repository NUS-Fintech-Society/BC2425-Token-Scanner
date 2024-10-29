// services/socialSentiment.js
const { TwitterApi } = require('twitter-api-v2');
const natural = require('natural');
const sentiment = require('sentiment');
const config = require('../config');

class SocialSentimentAnalyzer {
    constructor() {
        this.initializeTwitterClient();
        this.tokenizer = new natural.WordTokenizer();
        this.sentiment = new sentiment();
        this.useMockData = process.env.USE_MOCK_DATA === 'true';
    }

    initializeTwitterClient() {
        try {
            if (process.env.TWITTER_API_KEY) {
                this.twitterClient = new TwitterApi({
                    appKey: process.env.TWITTER_API_KEY,
                    appSecret: process.env.TWITTER_API_SECRET,
                    accessToken: process.env.TWITTER_ACCESS_TOKEN,
                    accessSecret: process.env.TWITTER_ACCESS_SECRET,
                });
            } else {
                console.warn('Twitter API credentials not found, using mock data');
                this.useMockData = true;
            }
        } catch (error) {
            console.error('Error initializing Twitter client:', error);
            this.useMockData = true;
        }
    }

    async analyzeSentiment(token) {
        try {
            console.log(`Analyzing sentiment for token: ${token.ticker}`);
            
            const socialData = await this.collectSocialData(token);
            const sentimentScores = this.calculateSentimentScores(socialData);
            const trendingMetrics = await this.analyzeTrendingMetrics(token);
            const influencerImpact = await this.analyzeInfluencerImpact(token);

            const analysis = {
                overallScore: this.calculateOverallScore(sentimentScores),
                details: {
                    twitter: sentimentScores.twitter,
                    telegram: sentimentScores.telegram,
                    reddit: sentimentScores.reddit,
                    trending: trendingMetrics
                },
                momentum: this.calculateMomentum(socialData),
                influencerImpact,
                lastUpdated: new Date().toISOString()
            };

            console.log(`Sentiment analysis completed for ${token.ticker}`);
            return analysis;
        } catch (error) {
            console.error('Error in sentiment analysis:', error);
            return this.getDefaultSentimentResponse();
        }
    }

    async collectSocialData(token) {
        try {
            const [twitterData, telegramData, redditData] = await Promise.all([
                this.getTwitterMentions(token),
                this.getTelegramActivity(token),
                this.getRedditDiscussions(token)
            ]);

            return {
                twitter: twitterData,
                telegram: telegramData,
                reddit: redditData
            };
        } catch (error) {
            console.error('Error collecting social data:', error);
            return this.getMockSocialData(token);
        }
    }

    async getTwitterMentions(token) {
        if (this.useMockData) {
            return this.getMockTwitterMentions(token);
        }

        try {
            if (!this.twitterClient) {
                throw new Error('Twitter client not initialized');
            }

            const query = `${token.ticker} OR ${token.address}`;
            const tweets = await this.twitterClient.v2.search(query, {
                'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
                'user.fields': ['verified', 'public_metrics'],
                'expansions': ['author_id'],
                max_results: 100
            });

            return this.processTweets(tweets);
        } catch (error) {
            console.error('Error fetching Twitter mentions:', error);
            return this.getMockTwitterMentions(token);
        }
    }

    processTweets(tweets) {
        if (!tweets?.data) return [];

        return tweets.data.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            engagement: tweet.public_metrics || {},
            timestamp: tweet.created_at,
            authorId: tweet.author_id,
            metrics: {
                retweets: tweet.public_metrics?.retweet_count || 0,
                likes: tweet.public_metrics?.like_count || 0,
                replies: tweet.public_metrics?.reply_count || 0,
                quotes: tweet.public_metrics?.quote_count || 0
            }
        }));
    }

    async getTelegramActivity(token) {
        // In a real implementation, you would integrate with Telegram API
        return this.getMockTelegramActivity(token);
    }

    async getRedditDiscussions(token) {
        // In a real implementation, you would integrate with Reddit API
        return this.getMockRedditDiscussions(token);
    }

    calculateSentimentScores(socialData) {
        return {
            twitter: this.analyzePlatformSentiment(socialData.twitter),
            telegram: this.analyzePlatformSentiment(socialData.telegram),
            reddit: this.analyzePlatformSentiment(socialData.reddit)
        };
    }

    analyzePlatformSentiment(posts) {
        const results = posts.reduce((acc, post) => {
            const analysis = this.sentiment.analyze(post.text);
            const engagement = this.calculateEngagement(post);
            
            return {
                score: acc.score + (analysis.score * engagement),
                engagement: acc.engagement + engagement,
                volume: acc.volume + 1,
                positiveCount: acc.positiveCount + (analysis.score > 0 ? 1 : 0),
                negativeCount: acc.negativeCount + (analysis.score < 0 ? 1 : 0),
                neutralCount: acc.neutralCount + (analysis.score === 0 ? 1 : 0)
            };
        }, this.getInitialSentimentAccumulator());

        return {
            ...results,
            averageScore: results.score / (results.volume || 1),
            sentimentRatio: results.positiveCount / (results.negativeCount || 1),
            engagementRate: results.engagement / (results.volume || 1)
        };
    }

    calculateEngagement(post) {
        const {
            retweets = 0,
            likes = 0,
            replies = 0,
            quotes = 0
        } = post.metrics || {};

        return (
            retweets * 2 +
            likes * 1 +
            replies * 1.5 +
            quotes * 2
        );
    }

    calculateOverallScore(sentimentScores) {
        const weights = {
            twitter: 0.5,
            telegram: 0.3,
            reddit: 0.2
        };

        return Object.entries(sentimentScores).reduce((total, [platform, data]) => {
            const platformScore = this.calculatePlatformScore(data);
            return total + (platformScore * weights[platform]);
        }, 0);
    }

    calculatePlatformScore(data) {
        const sentimentWeight = data.averageScore * 0.4;
        const engagementWeight = Math.min(Math.log10(data.engagement + 1) / 4, 1) * 0.3;
        const volumeWeight = Math.min(Math.log10(data.volume + 1) / 2, 1) * 0.3;

        return sentimentWeight + engagementWeight + volumeWeight;
    }

    // Mock Data Generation
    getMockSocialData(token) {
        return {
            twitter: this.getMockTwitterMentions(token),
            telegram: this.getMockTelegramActivity(token),
            reddit: this.getMockRedditDiscussions(token)
        };
    }

    getMockTwitterMentions(token) {
        const mentionCount = Math.floor(Math.random() * 20) + 5;
        return Array(mentionCount).fill(null).map(() => ({
            id: `tweet_${Math.random().toString(36).substr(2, 9)}`,
            text: this.generateMockTweetText(token),
            metrics: {
                retweets: Math.floor(Math.random() * 100),
                likes: Math.floor(Math.random() * 500),
                replies: Math.floor(Math.random() * 50),
                quotes: Math.floor(Math.random() * 20)
            },
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }));
    }

    getMockTelegramActivity(token) {
        const activityCount = Math.floor(Math.random() * 15) + 5;
        return Array(activityCount).fill(null).map(() => ({
            id: `tg_${Math.random().toString(36).substr(2, 9)}`,
            text: this.generateMockMessageText(token),
            metrics: {
                views: Math.floor(Math.random() * 1000),
                forwards: Math.floor(Math.random() * 50),
                replies: Math.floor(Math.random() * 30)
            },
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }));
    }

    getMockRedditDiscussions(token) {
        const discussionCount = Math.floor(Math.random() * 10) + 3;
        return Array(discussionCount).fill(null).map(() => ({
            id: `reddit_${Math.random().toString(36).substr(2, 9)}`,
            text: this.generateMockRedditText(token),
            metrics: {
                upvotes: Math.floor(Math.random() * 200),
                comments: Math.floor(Math.random() * 100),
                awards: Math.floor(Math.random() * 5)
            },
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }));
    }

    generateMockTweetText(token) {
        const templates = [
            `Bullish on $${token.ticker}! 🚀`,
            `$${token.ticker} looking strong today`,
            `Just bought more $${token.ticker}`,
            `$${token.ticker} technical analysis looks promising`,
            `Great community behind $${token.ticker}`,
            `$${token.ticker} to the moon! 💎🙌`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    generateMockMessageText(token) {
        const templates = [
            `${token.ticker} price discussion`,
            `Technical analysis for ${token.ticker}`,
            `${token.ticker} community update`,
            `New developments for ${token.ticker}`,
            `${token.ticker} trading strategy`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    generateMockRedditText(token) {
        const templates = [
            `[Discussion] ${token.ticker} price action`,
            `[Analysis] ${token.ticker} fundamental review`,
            `Why ${token.ticker} is undervalued`,
            `${token.ticker} technical analysis`,
            `The future of ${token.ticker}`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    getInitialSentimentAccumulator() {
        return {
            score: 0,
            engagement: 0,
            volume: 0,
            positiveCount: 0,
            negativeCount: 0,
            neutralCount: 0
        };
    }

    getDefaultSentimentResponse() {
        return {
            overallScore: 0,
            details: {
                twitter: this.getDefaultPlatformMetrics(),
                telegram: this.getDefaultPlatformMetrics(),
                reddit: this.getDefaultPlatformMetrics(),
                trending: this.getDefaultTrendingMetrics()
            },
            momentum: 0,
            influencerImpact: this.getDefaultInfluencerImpact(),
            lastUpdated: new Date().toISOString()
        };
    }

    getDefaultPlatformMetrics() {
        return {
            score: 0,
            engagement: 0,
            volume: 0,
            positiveCount: 0,
            negativeCount: 0,
            neutralCount: 0,
            averageScore: 0,
            sentimentRatio: 1,
            engagementRate: 0
        };
    }

    getDefaultTrendingMetrics() {
        return {
            momentum: 0,
            peakMentions: 0,
            trend: 'neutral',
            viralityScore: 0
        };
    }

    getDefaultInfluencerImpact() {
        return {
            totalReach: 0,
            topInfluencers: [],
            impactScore: 0
        };
    }
}

module.exports = SocialSentimentAnalyzer;