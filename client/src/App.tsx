import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ApiStatusIndicator } from "@/components/ui/api-status-indicator";
import NotFound from "@/pages/not-found";
import Partners from "@/pages/partners";
import Home from "@/pages/home";
import Clients from "@/pages/clients";
import Licenses from "@/pages/licenses";
import Devices from "@/pages/devices";
import Updates from "@/pages/updates";
import Users from "@/pages/users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/partners" component={Partners} />
      <Route path="/clients" component={Clients} />
      <Route path="/licenses" component={Licenses} />
      <Route path="/devices" component={Devices} />
      <Route path="/updates" component={Updates} />
      <Route path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <Router />
        <ApiStatusIndicator />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
