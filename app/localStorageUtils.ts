import { useLocalStorage } from "@uidotdev/usehooks";
import { v4 as uuidv4 } from 'uuid';

const SUBSCRIPTIONS_KEY = "subscriptions";

// Define the Subscription type
type Subscription = {
  id: string;
  // Add other properties as needed
};

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>(SUBSCRIPTIONS_KEY, []);

  const addSubscription = (subscription: Subscription) => {
    subscription.id = uuidv4(); // Ensure unique ID
    setSubscriptions((prevSubscriptions) => [...prevSubscriptions, subscription]);
  };

  const getSubscriptions = () => {
    return subscriptions;
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prevSubscriptions) => prevSubscriptions.filter(sub => sub.id !== id));
  };

  return {
    subscriptions,
    addSubscription,
    getSubscriptions,
    deleteSubscription,
  };
}
