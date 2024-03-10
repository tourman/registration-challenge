import { createRoot } from 'react-dom/client';
import main from 'main';

const root = createRoot(document.getElementById('root') as HTMLElement);

main((...args: Parameters<typeof root.render>) => root.render(...args));
