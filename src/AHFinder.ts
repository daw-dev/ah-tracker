export interface Opportunity {
  itemSimpleName: string;
  auction?: Auction;
  probableSellPrice?: number;
  probableAbsoluteProfit?: number;
  probablePercentageProfit?: number;
  otherAuctions: Auction[];
}

export interface Auction {
  uuid: string;
  start: number;
  end: number;
  item_name: string;
  category: string;
  claimed: boolean;
  starting_bid: number;
  bin: boolean;
}

type OpportunitiesUpdateCallback = (opportunities: Opportunity[]) => void;

const opportunitiesUpdateListeners: OpportunitiesUpdateCallback[] = [];

async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function auctionSearch() {
  while (true) {
    const allAuctions = await getAllAuctions();
    const opportunities = getAuctionGroups(allAuctions);
    opportunitiesUpdateListeners.forEach((listener) => listener(opportunities));

    await sleep(2500);
  }
}

async function getAllAuctions() {
  const response = await fetch("https://api.hypixel.net/v2/skyblock/auctions");

  if (response.status !== 200) throw "bad request";

  const data = await response.json();
  const auctionPagesCount = data.totalPages;

  const auctions = data.auctions as Auction[];

  const otherPromises: Promise<void>[] = [];

  for (let page = 1; page < auctionPagesCount; page++) {
    async function fetchNext() {
      const otherResponse = await fetch(
        `https://api.hypixel.net/v2/skyblock/auctions?page=${page}`
      );
      const otherData = await otherResponse.json();

      auctions.push(...(otherData.auctions as Auction[]));
    }

    otherPromises.push(fetchNext());
  }

  await Promise.all(otherPromises);

  return auctions;
}

function getAuctionGroups(allAuctions: Auction[]) {
  const modifiedAuctions = allAuctions
    .filter((auction) => !auction.claimed)
    .filter((auction) => auction.bin)
    .filter((auction) => !["misc", "blocks"].includes(auction.category));

  const auctionMap = new Map<String, Opportunity>();

  modifiedAuctions.forEach((auction) => {
    const simpleName = simplifyItemName(auction.item_name);

    if (auctionMap.has(simpleName)) {
      auctionMap.get(simpleName)!.otherAuctions.push(auction);
    } else {
      auctionMap.set(simpleName, {
        itemSimpleName: simpleName,
        otherAuctions: [auction],
      });
    }
  });

  let opportunities = [...auctionMap.values()].filter(
    (auctionGroup) => auctionGroup.otherAuctions.length > 10
  );

  opportunities.forEach((opportunity) => {
    opportunity.otherAuctions.sort((a, b) => a.starting_bid - b.starting_bid);
    opportunity.auction = opportunity.otherAuctions.shift();
  });

  opportunities = opportunities.filter(
    (opportunity) => opportunity.auction!.starting_bid <= maxAuctionCost
  );

  opportunities.forEach(calculateOpportunity);

  return opportunities
    .filter(
      (opportunity) =>
        opportunity.probableAbsoluteProfit! > minAbsoluteProfit &&
        opportunity.probablePercentageProfit! > minPercentageProfit
    )
    .sort((a, b) => b.probableAbsoluteProfit! - a.probableAbsoluteProfit!);
}

let minAbsoluteProfit = 300_000;
let minPercentageProfit = 30;
let maxAuctionCost = 1_000_000;

function calculateOpportunity(opportunity: Opportunity) {
  const checkCount = 5;
  let costSum = 0;
  for (let i = 0; i < checkCount; i++) {
    costSum += opportunity.otherAuctions[i].starting_bid;
  }

  const average = costSum / checkCount;
  const medianValue =
    opportunity.otherAuctions[Math.floor(checkCount / 2)].starting_bid;

  const buyPrice = opportunity.auction!.starting_bid;

  const probableSellPrice =
    (opportunity.otherAuctions[0].starting_bid * 90 +
      average * 5 +
      medianValue * 5) /
    100;
  const probableAbsoluteProfit = probableSellPrice - buyPrice;
  const probablePercentageProfit = (probableAbsoluteProfit * 100) / buyPrice;

  opportunity.probableSellPrice = probableSellPrice;
  opportunity.probableAbsoluteProfit = probableAbsoluteProfit;
  opportunity.probablePercentageProfit = probablePercentageProfit;
}

const reforges = [
  "Epic",
  "Fair",
  "Fast",
  "Gentle",
  "Heroic",
  "Legendary",
  "Odd",
  "Sharp",
  "Spicy",
  "Awkward",
  "Deadly",
  "Fine",
  "Grand",
  "Hastly",
  "Neat",
  "Rapid",
  "Rich",
  "Unreal",
  "Clean",
  "Fierce",
  "Heavy",
  "Light",
  "Mythic",
  "Pure",
  "Titanic",
  "Smart",
  "Wise",
  "Stained",
  "Menacing",
  "Hefty",
  "Soft",
  "Honored",
  "Blended",
  "Astute",
  "Colossal",
  "Brilliant",
  "Unyielding",
  "Prospector's",
  "Excellent",
  "Sturdy",
  "Fortunate",
  "Great",
  "Rugged",
  "Lush",
  "Lumberjack's",
  "Double-Bit",
  "Robust",
  "Zooming",
  "Peasant's",
  "Green Thumb",
  "Coldfused",
  "Dirty",
  "Fabled",
  "Gilded",
  "Suspicious",
  "Warped",
  "Withered",
  "Bulky",
  "Jerry's",
  "Fanged",
  "Precise",
  "Spiritual",
  "Headstrong",
  "Candied",
  "Submerged",
  "Perfect",
  "Reinforced",
  "Renowned",
  "Spiked",
  "Hyper",
  "Giant",
  "Jaded",
  "Cubic",
  "Necrotic",
  "Empowered",
  "Ancient",
  "Undead",
  "Loving",
  "Ridiculous",
  "Bustling",
  "Mossy",
  "Festive",
  "Greater Spook",
  "Glistening",
  "Strengthened",
  "Waxed",
  "Fortified",
  "Rooted",
  "Blooming",
  "Snowy",
  "Blood-Soaked",
  "Salty",
  "Treacherous",
  "Lucky",
  "Stiff",
  "Dirty",
  "Chomp",
  "Pitchin'",
  "Ambered",
  "Auspicious",
  "Fleet",
  "Heated",
  "Magnetic",
  "Mithraic",
  "Refined",
  "Stellar",
  "Fruitful",
  "Moil",
  "Toil",
  "Blessed",
  "Earthy",
  "Bountiful",
  "Beady",
  "Buzzing",
  "Very",
  "Highly",
  "Extremely",
  "Not So",
  "Thicc",
  "Absolutely",
  "Even More",
  "Greater",
];

function simplifyItemName(itemName: string) {
  // remove reforges
  reforges.forEach(
    (reforge) => (itemName = itemName.replace(`${reforge} `, ""))
  );

  // remove dungeon stars
  if (
    itemName.charCodeAt(itemName.length - 2) === 10026 ||
    itemName.charCodeAt(itemName.length - 1) === 10026
  ) {
    const lastSpace = itemName.lastIndexOf(" ");
    itemName = itemName.substring(0, lastSpace);
  }

  // remove pet levels
  itemName = itemName.replace(/^\[Lvl \d{1,3}\] /, "");

  // remove spaces
  itemName = itemName.trim();

  return itemName;
}

auctionSearch();

export default function addOpportunitiesUpdateListener(
  newListener: OpportunitiesUpdateCallback
) {
    opportunitiesUpdateListeners.push(newListener);
}
