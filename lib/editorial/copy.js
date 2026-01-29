/**
 * Editorial copy templates
 * 30 variations per theme for variety
 */

import { formatPrice, formatChange, formatVolume, formatMultiplier } from '../formatters.js';

export const EDITORIAL_COPY = {
  bigMovers: [
    "The market is moving fast. When odds shift this hard, someone knows something.",
    "This isn't noise — it's a signal. Smart money is repositioning.",
    "A swing this big doesn't happen by accident. The narrative just changed.",
    "Surging {direction} {change} in 24 hours. The market has spoken.",
    "Sharp movement: {outcome} odds shift {change}. Pay attention.",
    "Market reacts with {change} swing today. Something's brewing.",
    "{outcome} {direction} momentum building. This is the story.",
    "Big move alert: {change} in one day. The odds are shifting.",
    "When money moves this fast, it's worth watching.",
    "The smart money is talking. {change} swing in 24 hours.",
    "Odds don't lie. This {change} move tells a story.",
    "The market just made a statement. {change} and counting.",
    "Follow the money. It's moving {direction} fast.",
    "This kind of volatility means information is flowing.",
    "A {change} shift isn't random. Something changed.",
    "The betting public is reacting. {change} today alone.",
    "When you see movement like this, the narrative shifted.",
    "Big swings, big signals. {change} move worth noting.",
    "The market is repricing in real time. {change} and climbing.",
    "Sharp {direction} movement. The crowd is recalibrating.",
    "This is what conviction looks like. {change} in a day.",
    "Money talks, and right now it's screaming {direction}.",
    "The odds are on the move. {change} shift today.",
    "When markets move this fast, pay attention.",
    "A decisive {change} swing. The market knows something.",
    "Rapid repricing underway. {change} and accelerating.",
    "This {direction} momentum has legs.",
    "The market just woke up. {change} move in hours.",
    "When odds shift this dramatically, trust the signal.",
    "Major movement detected. {change} swing today."
  ],

  debateFuel: [
    "The market can't decide. Neither can Vegas. Pick your side.",
    "A true coin flip. This is where debates get heated.",
    "Split down the middle at {price}. Everyone has an opinion.",
    "Too close to call. The perfect argument starter.",
    "Coin flip territory: {price}. Where do you stand?",
    "The ultimate 50/50. Make your case.",
    "Dead heat. This is what makes prediction markets fun.",
    "Neither side is backing down. {price} and holding.",
    "The market is torn. Time to pick a side.",
    "Even odds, endless debate. What's your take?",
    "At {price}, this is anyone's game.",
    "The market can't make up its mind. Can you?",
    "Perfectly balanced. The debate rages on.",
    "This close? Every argument matters.",
    "Sitting at {price}. The definition of uncertainty.",
    "When it's this tight, conviction is everything.",
    "The market is deadlocked. Break the tie.",
    "Neither bull nor bear has the edge. Yet.",
    "At these odds, your vote actually matters.",
    "This is the kind of market that starts arguments.",
    "Too close for comfort. Or too close for certainty.",
    "The market says maybe. What do you say?",
    "Genuine uncertainty at {price}. Rare and valuable.",
    "When smart money is split, trust your gut.",
    "The ultimate toss-up. No clear favorite here.",
    "At {price}, the market admits it doesn't know.",
    "This is peak uncertainty. And peak opportunity.",
    "Neither side can pull away. Classic debate fuel.",
    "The market is holding its breath at {price}.",
    "Evenly matched. This is what makes it interesting."
  ],

  sentimentGaps: [
    "Fan optimism is way higher than the smart money. Who's right?",
    "The market says one thing. The fans say another. Someone's wrong.",
    "Market says {marketPrice}, you say {crowdVote}. Let's settle this.",
    "{gap} gap between traders and fans. Massive disconnect.",
    "Who's right — the money or the crowd? {gap} says it matters.",
    "Traders vs fans: {gap} disagreement. Someone will eat crow.",
    "The crowd sees it differently. {gap} differently, to be exact.",
    "Your fellow fans disagree with Wall Street by {gap}.",
    "The wisdom of crowds vs the wisdom of wallets.",
    "A {gap} sentiment gap. That's not small.",
    "The market and the people aren't on the same page.",
    "Professional money vs passionate fans. {gap} apart.",
    "This {gap} gap is begging to be closed.",
    "Either the market is wrong or the fans are dreaming.",
    "When sentiment diverges this much, opportunity knocks.",
    "The crowd is {direction} than the market by {gap}.",
    "This disconnect doesn't usually last long.",
    "Someone is about to be very right or very wrong.",
    "Market price and fan conviction: {gap} apart.",
    "The betting public and the watching public disagree.",
    "This gap represents real disagreement, not noise.",
    "Traders see {marketPrice}. Fans see {crowdVote}. Fight.",
    "A {gap} disconnect between money and passion.",
    "The market is efficient. Unless the crowd knows better.",
    "When fans and bettors disagree, someone wins big.",
    "This sentiment gap is too big to ignore.",
    "Market says {marketPrice}. Crowd says different. {gap} different.",
    "Professional vs popular opinion: {gap} spread.",
    "Either the market catches up or the crowd wakes up.",
    "This {gap} disagreement will resolve one way."
  ],

  longshotWatch: [
    "The market says no way. But momentum says... maybe?",
    "At {price}, this is a moonshot with upside.",
    "Longshot alert: {outcome} climbing quietly.",
    "{multiplier} potential payout if this hits. Worth a look.",
    "Dark horse gaining ground at {price}. Don't sleep on it.",
    "Underdog on the move. The odds are shifting.",
    "Low odds, high potential. Classic longshot territory.",
    "At these odds, believers are being rewarded.",
    "The market doubts it. The momentum doesn't care.",
    "A true underdog story developing at {price}.",
    "Longshots don't stay longshots forever. Movement spotted.",
    "When a longshot gains steam, pay attention.",
    "{price} odds but trending up. Something's happening.",
    "The darkhorse is stirring. {outcome} on the move.",
    "Smart money starting to nibble on this longshot.",
    "At {multiplier} potential, the risk/reward is interesting.",
    "Low probability, high conviction for some.",
    "This longshot has believers, and they're buying.",
    "Unlikely? Yes. Impossible? The market is reconsidering.",
    "When underdogs start moving, upsets follow.",
    "A {price} price tag with upward momentum.",
    "The crowd loves an underdog. This one's trending.",
    "Moonshot territory with actual movement.",
    "Don't count this one out. {outcome} is climbing.",
    "At these odds, believers see value others don't.",
    "The market is slowly warming to this longshot.",
    "A dark horse with momentum is dangerous.",
    "Low odds, growing conviction. Classic setup.",
    "{multiplier} payout potential if lightning strikes.",
    "Longshot gaining ground. The impossible becomes possible."
  ],

  crowdFavorites: [
    "The fans have spoken. And they're not being subtle about it.",
    "Crowd consensus: {conviction} say {direction}. Overwhelming.",
    "The people have spoken — {outcome} is the pick at {conviction}.",
    "Overwhelming audience confidence. {conviction} agreement.",
    "Fan favorite at {conviction}. This is consensus.",
    "The crowd is certain. {conviction} certain, to be exact.",
    "When {conviction} agree, that's not noise. That's signal.",
    "The popular vote is in: {outcome} by a landslide.",
    "Crowd conviction at {conviction}. Hard to ignore.",
    "The audience has decided. {conviction} agreement.",
    "This level of consensus is rare. {conviction} say {direction}.",
    "The people's choice at {conviction}. Democracy in action.",
    "When the crowd speaks this loudly, listen.",
    "A {conviction} favorite. The audience has spoken.",
    "Overwhelming support for {outcome}. {conviction} strong.",
    "The crowd is rarely this unified. {conviction} agreement.",
    "Popular opinion has chosen. {conviction} confident.",
    "Fan conviction is off the charts at {conviction}.",
    "The wisdom of crowds says {direction}. {conviction} worth.",
    "When {conviction} of fans agree, pay attention.",
    "A decisive crowd favorite. {conviction} can't be wrong... right?",
    "The audience vote is in: {conviction} for {outcome}.",
    "This is what crowd conviction looks like.",
    "The fans are aligned. {conviction} aligned.",
    "Consensus building at {conviction}. The crowd knows.",
    "When this many people agree, it's worth noting.",
    "The popular vote: {outcome} at {conviction}.",
    "Crowd confidence is through the roof.",
    "{conviction} fan support. That's decisive.",
    "The people's champion at {conviction} conviction."
  ],

  volumeSurge: [
    "Money is POURING in. Something's got people's attention.",
    "{volume24h} traded in last 24 hours. That's significant.",
    "Volume spike: {percentage}% of all-time today. Alert.",
    "Money talks — big bets flowing in right now.",
    "Trading frenzy on this market. Volume exploding.",
    "Volume surge alert. The market is heating up.",
    "When volume spikes like this, information is moving.",
    "The money is flooding in. {volume24h} and counting.",
    "{percentage}% of total volume in 24 hours. Something's up.",
    "Capital is moving fast. Follow the money.",
    "Volume doesn't lie. And it's screaming right now.",
    "Major inflows detected. {volume24h} in a day.",
    "When bettors pile in like this, pay attention.",
    "The market just got a lot more liquid.",
    "Trading activity is spiking. {percentage}% of all-time today.",
    "Money is speaking. {volume24h} worth of opinions.",
    "This volume surge means conviction is high.",
    "Capital is voting with its feet. {volume24h} today.",
    "When this much money moves, narratives change.",
    "Volume explosion underway. Something triggered this.",
    "The betting public is engaged. Very engaged.",
    "{volume24h} in 24 hours. The market is alive.",
    "Follow the volume. It's heading here.",
    "When money rushes in, opportunity follows.",
    "This volume spike is telling a story.",
    "Major market activity. {percentage}% surge.",
    "The money is talking loud today.",
    "Volume at {volume24h}. That's not normal.",
    "When capital concentrates, information flows.",
    "The market is buzzing. {volume24h} proves it."
  ],

  fadingFast: [
    "The odds are collapsing. Yesterday's favorite is today's afterthought.",
    "Fading: {outcome} drops {change}. The slide continues.",
    "Confidence crumbling — down {change} today. Brutal.",
    "The slide continues. No bottom in sight yet.",
    "Losing support fast. {change} and falling.",
    "Sharp decline in progress. {outcome} in freefall.",
    "The market is abandoning this position. {change} drop.",
    "Yesterday's darling is today's dump. Down {change}.",
    "Support is evaporating. {change} decline today.",
    "The fade is real. {outcome} dropping hard.",
    "When odds collapse this fast, sentiment shifted.",
    "The market lost faith. {change} in a day.",
    "This freefall isn't slowing down. {change} gone.",
    "From contender to afterthought. {change} slide.",
    "The bottom keeps dropping. {change} and counting.",
    "Market confidence is cratering. {change} loss.",
    "This collapse is accelerating. Watch out below.",
    "The smart money is running. {change} exit.",
    "When fades happen this fast, it's information.",
    "Yesterday's hope is today's disappointment.",
    "The sell-off is brutal. {change} and dropping.",
    "Support vanished. {change} decline in hours.",
    "The market made up its mind. Downward.",
    "This isn't a dip — it's a collapse. {change}.",
    "Conviction is crumbling. {change} freefall.",
    "The exodus is underway. {change} and accelerating.",
    "When odds fade this hard, trust the market.",
    "The bottom fell out. {change} today alone.",
    "Yesterday's favorite, today's fade. {change} gone.",
    "Market sentiment collapsed. {change} in flames."
  ],

  mostEngaged: [
    "This market has everyone talking. And voting. A lot.",
    "{voteCount} votes and counting. Peak engagement.",
    "Fan favorite: high engagement across the board.",
    "Your audience is watching this one closely.",
    "Most voted market today. {voteCount} opinions.",
    "Hot topic: {voteCount} votes. The people care.",
    "Engagement is through the roof on this one.",
    "The audience can't stop voting. {voteCount} so far.",
    "This is the market everyone's watching.",
    "{voteCount} votes. That's serious engagement.",
    "The people have opinions. {voteCount} of them.",
    "Peak engagement territory. {voteCount} votes.",
    "This market captured the audience's attention.",
    "Everyone wants a say. {voteCount} votes cast.",
    "The most engaging market in rotation.",
    "{voteCount} fans weighed in. That's massive.",
    "When this many people vote, it matters.",
    "Audience participation at its peak. {voteCount}.",
    "This is what engagement looks like.",
    "The crowd is invested. {voteCount} votes deep.",
    "Maximum audience interest on this one.",
    "{voteCount} opinions and counting. Hot market.",
    "The fans are locked in. High engagement.",
    "This market struck a nerve. {voteCount} votes.",
    "Peak participation achieved. {voteCount} strong.",
    "The audience is all in. {voteCount} votes.",
    "When engagement spikes, so does interest.",
    "This is the conversation everyone's having.",
    "{voteCount} votes. The market with all the buzz.",
    "Maximum crowd participation. {voteCount} engaged."
  ],

  freshMarkets: [
    "New market just opened. Get in on the ground floor.",
    "Fresh odds available. The opening line is set.",
    "Just listed — get in early before it moves.",
    "Brand new market. Opening odds are live.",
    "Opening odds on a fresh market. Act fast.",
    "New opportunity just dropped. Early movers win.",
    "Fresh out of the gate. Opening price set.",
    "The market just opened. First mover advantage.",
    "New listing alert. Initial odds are live.",
    "Brand new and ready to trade. Get in early.",
    "Opening bell on this fresh market.",
    "Just added to the board. Opening odds set.",
    "New market, new opportunity. Prices are fresh.",
    "The ink is still wet on this one.",
    "Fresh odds, fresh opportunity. Just listed.",
    "Ground floor pricing on a new market.",
    "This market just went live. Opening odds set.",
    "New and untested. Opening prices available.",
    "Just opened. The market is finding its level.",
    "Fresh off the press. Initial odds are in.",
    "New listing. Get in before price discovery.",
    "The market just launched. Early action matters.",
    "Brand new odds available. Fresh market alert.",
    "Opening prices set on a new opportunity.",
    "Just added. The market is still forming.",
    "New market, opening odds. Time is ticking.",
    "Fresh opportunity just hit the board.",
    "The market is new. The odds are soft.",
    "Just listed. Opening prices won't last.",
    "New market alert. Get in while it's fresh."
  ]
};

/**
 * Theme display labels
 */
export const THEME_LABELS = {
  bigMovers: 'BIG MOVER',
  debateFuel: 'DEBATE FUEL',
  sentimentGaps: 'SENTIMENT GAP',
  longshotWatch: 'LONGSHOT WATCH',
  crowdFavorites: 'CROWD FAVORITE',
  volumeSurge: 'VOLUME SURGE',
  fadingFast: 'FADING FAST',
  mostEngaged: 'MOST ENGAGED',
  freshMarkets: 'FRESH MARKET',
};

/**
 * Theme colors (accent colors for visual distinction)
 */
export const THEME_COLORS = {
  bigMovers: '#ff6b2b',      // Orange
  debateFuel: '#a29bfe',     // Purple
  sentimentGaps: '#00b4ff',  // Blue
  longshotWatch: '#f1c40f',  // Yellow
  crowdFavorites: '#e056fd', // Pink
  volumeSurge: '#00cec9',    // Teal
  fadingFast: '#ff4757',     // Red
  mostEngaged: '#fd79a8',    // Rose
  freshMarkets: '#00d68f',   // Green
};

/**
 * Generate editorial copy for a market and theme
 * @param {string} theme - Theme name
 * @param {object} market - Market with editorial metadata
 * @returns {string} - Generated copy text
 */
export function generateEditorialCopy(theme, market) {
  const templates = EDITORIAL_COPY[theme];
  if (!templates || templates.length === 0) {
    return '';
  }

  // Select a random template for variety
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Replace placeholders with actual values
  const outcome = market.outcomes[0]?.name || market.question;
  const price = market.outcomes[0]?.price || 0;
  const change = market.outcomes[0]?.change24h || 0;

  const replacements = {
    '{outcome}': outcome,
    '{price}': formatPrice(price),
    '{change}': formatChange(change),
    '{direction}': change >= 0 ? 'up' : 'down',
    '{multiplier}': formatMultiplier(price),
    '{volume24h}': formatVolume(market.volume24h || 0),
    '{percentage}': market.volume > 0
      ? Math.round((market.volume24h / market.volume) * 100)
      : 0,
    '{marketPrice}': formatPrice(price),
    '{crowdVote}': market.crowdVote !== undefined
      ? formatPrice(market.crowdVote)
      : 'N/A',
    '{gap}': market.gap !== undefined
      ? formatPrice(market.gap)
      : 'N/A',
    '{conviction}': market.conviction !== undefined
      ? formatPrice(market.conviction)
      : 'N/A',
    '{voteCount}': market.voteCount || 0,
  };

  let copy = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    copy = copy.replace(new RegExp(placeholder, 'g'), value);
  }

  return copy;
}

/**
 * Add editorial metadata to a market
 * @param {string} theme - Theme name
 * @param {object} market - Market object
 * @returns {object} - Market with editorial metadata
 */
export function enrichWithEditorial(theme, market) {
  return {
    ...market,
    theme,
    editorialCopy: generateEditorialCopy(theme, market),
    themeLabel: THEME_LABELS[theme] || theme.toUpperCase(),
    themeColor: THEME_COLORS[theme] || '#FFFFFF',
  };
}
