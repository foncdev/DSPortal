import ErrorBoundary from "./layouts/components/common/ErrorBoundary";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./routes";
import './styles/main.scss';

function App(): JSX.Element {

    return (
        <ErrorBoundary>
            <AppProviders>
                <AppRoutes />
            </AppProviders>
        </ErrorBoundary>
    );
}

export default App;