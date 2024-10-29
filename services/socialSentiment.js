// Add to services/socialSentiment.js
const Twitter = require('twitter-api-v2');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const sentiment = require('sentiment');

class SocialSentimentAnalyzer {
    constructor() {
        this.twitterClient = new Twitter({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });
    }

    async analyzeSentiment(token) {
        const socialData = await this.collectSocialData(token);
        const sentimentScores = this.calculateSentimentScores(socialData);
        const trendingMetrics = await this.analyzeTrendingMetrics(token);

        return {
            overallScore: this.calculateOverallScore(sentimentScores),
            details: {
                twitter: sentimentScores.twitter,
                telegram: sentimentScores.telegram,
                reddit: sentimentScores.reddit,
                trending: trendingMetrics
            }
        };
    }

    async collectSocialData(token) {
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
    }

    async getTwitterMentions(token) {
        const query = `${token.ticker} OR ${token.address}`;
        const tweets = await this.twitterClient.v2.search(query);
        return tweets.data.map(tweet => ({
            text: tweet.text,
            engagement: tweet.public_metrics,
            timestamp: tweet.created_at
        }));
    }

    calculateSentimentScores(socialData) {
        return {
            twitter: this.analyzePlatformSentiment(socialData.twitter),
            telegram: this.analyzePlatformSentiment(socialData.telegram),
            reddit: this.analyzePlatformSentiment(socialData.reddit)
        };
    }

    analyzePlatformSentiment(posts) {
        return posts.reduce((acc, post) => {
            const analysis = sentiment(post.text);
            return {
                score: acc.score + analysis.score,
                engagement: acc.engagement + this.calculateEngagement(post),
                volume: acc.volume + 1
            };
        }, { score: 0, engagement: 0, volume: 0 });
    }
}