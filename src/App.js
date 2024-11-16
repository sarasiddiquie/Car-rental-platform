import Layout from "./components/Layout/Layout";
import { UserProvider } from './UserContext';

function App() {
  return  <UserProvider>
  <Layout />
</UserProvider>
}

export default App;
