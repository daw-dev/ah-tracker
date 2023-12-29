import classNames from "classnames";
import { Auction, Opportunity } from "./AHFinder";
import "./AHFinderStyles.css";

interface AuctionProps {
  opportunity: Opportunity;
}

export default function OpportunityComponent({ opportunity }: AuctionProps) {
  const classnames = classNames("opportunity", opportunity.auction!.tier);
  return (
    <div className={classnames}>
      <div className="main-auction">
        <span
          className="item-name"
          onClick={() => console.log(opportunity.auction)}
        >
          {opportunity.auction!.item_name}
        </span>
        <span className="buy-price">
          Buy at {opportunity.auction!.starting_bid.toLocaleString()}
        </span>
        <span className="sell-price">
          Sell at{" "}
          {opportunity.probableSellPrice!.toLocaleString(undefined, {
            maximumSignificantDigits: 3,
          })}
        </span>
        <span className="profit">
          Profit:{" "}
          {opportunity.probableAbsoluteProfit!.toLocaleString(undefined, {
            maximumSignificantDigits: 3,
          })}{" "}
          (
          {opportunity.probablePercentageProfit!.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
          %)
        </span>
        <button
          className="copy-button"
          onClick={(evt) => {
            const command = `/viewauction ${opportunity.auction!.uuid}`;
            navigator.clipboard.writeText(command);
            evt.currentTarget.textContent = "Copied!";
          }}
        >
          Copy auction command!
        </button>
      </div>
      <Others opportunity={opportunity} />
    </div>
  );
}

interface OthersProps {
  opportunity: Opportunity;
}

function Others({ opportunity }: OthersProps) {
  return (
    <div className="others">
      <span className="info">{opportunity.otherAuctions.length} other auctions ({opportunity.itemSimpleName}):</span>
      <div className="other-auctions">
        {opportunity.otherAuctions.map((auction) => (
          <SimpleAuction
            mainAuction={opportunity.auction!}
            auction={auction}
            key={auction.uuid}
          />
        ))}
      </div>
    </div>
  );
}

interface SimpleAuctionProps {
  mainAuction: Auction;
  auction: Auction;
}

function SimpleAuction({ mainAuction, auction }: SimpleAuctionProps) {
  const profit = auction.starting_bid - mainAuction.starting_bid;
  return (
    <div className="auction">
      <span className="item-name">{auction.item_name}</span>
      <span className="buy-price">Price:</span>
      <span className="buy-price">{auction.starting_bid.toLocaleString()}</span>
      <span className="profit">
        Difference: {profit.toLocaleString()} (
        {((profit * 100) / mainAuction.starting_bid).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
        %)
      </span>
    </div>
  );
}
