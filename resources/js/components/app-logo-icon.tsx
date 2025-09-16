import MyHubLogo from '@assets/myhub.svg';

export default function AppLogoIcon(props: React.HTMLAttributes<HTMLImageElement>) {
    return (
        <div
            style={{
                display: 'inline-block',
                backgroundColor: 'white',
                padding: '7px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
            }}
        >
            <img src={MyHubLogo} alt="Logo" {...props} />
        </div>
    );
}
