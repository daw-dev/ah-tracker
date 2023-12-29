import { useEffect, useState } from "react";
import "./App.css";
import addOpportunitiesUpdateListener, { Opportunity } from "./AHFinder";

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const opportunitiesUpdateCallback = function(opportunities: Opportunity[]) {
    console.log(opportunities.length);
    setOpportunities(opportunities.slice(0, 10));
  };

  useEffect(() => {
    addOpportunitiesUpdateListener(opportunitiesUpdateCallback);
  }, []);

  return (
    <div className="app">
      <h1>Auction House Tracker</h1>
      {opportunities.map((opportunity) => (
        <OpportunityComponent
          opportunity={opportunity}
          key={opportunity.auction!.uuid}
        />
      ))}
    </div>
  );
}

export default App;

interface AuctionProps {
  opportunity: Opportunity;
}

function OpportunityComponent({ opportunity }: AuctionProps) {
  return (
    <div>
      <h3>{opportunity.auction!.item_name}</h3>
      <h4>Buy at {opportunity.auction!.starting_bid.toLocaleString()}</h4>
      <h4>
        Sell at{" "}
        {opportunity.probableSellPrice!.toLocaleString(undefined, {
          maximumSignificantDigits: 3,
        })}
      </h4>
      <p>
        Profit:{" "}
        {opportunity.probableAbsoluteProfit!.toLocaleString(undefined, {
          maximumSignificantDigits: 3,
        })}{" "}
        (
        {opportunity.probablePercentageProfit!.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
        %)
      </p>
      <p>/viewauction {opportunity.auction!.uuid}</p>
    </div>
  );
}
