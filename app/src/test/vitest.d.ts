interface CustomMatchers<R = unknown> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string): R;
    // 추가 매처가 필요하면 여기에 선언
}

declare global {
    namespace Vi {
        interface Assertion extends CustomMatchers {}
        interface AsymmetricMatchersContaining extends CustomMatchers {}
    }
}