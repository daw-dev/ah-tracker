import { useEffect, useState } from "react";
import "./App.css";
import addOpportunitiesUpdateListener, { Opportunity } from "./AHFinder";
import OpportunityComponent from "./AHFinderComponents";

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const opportunitiesUpdateCallback = function (opportunities: Opportunity[]) {
    setOpportunities(opportunities.slice(0, 10));
  };

  useEffect(() => {
    addOpportunitiesUpdateListener(opportunitiesUpdateCallback);
  }, []);

  return (
    <div className="app">
      <h1>Auction House Tracker</h1>
      <div className="opportunities">
        {opportunities.map((opportunity) => (
          <OpportunityComponent
            opportunity={opportunity}
            key={opportunity.auction!.uuid}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
