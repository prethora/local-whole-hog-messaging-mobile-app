interface Process {
    env: {
        [key: string]: string | undefined;
    };
}

declare var process: Process;
