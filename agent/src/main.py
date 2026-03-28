"""
Main entry point for the agent
"""

import sys
from config import load_config, setup_logging
from scheduler import CollectionScheduler


def main():
    """Main function"""
    # Load configuration
    config = load_config('config.json')
    
    # Setup logging
    setup_logging(
        log_file=config.get('log_file', 'agent.log'),
        log_level=config.get('log_level', 'INFO'),
        max_log_size_mb=config.get('max_log_size_mb', 10)
    )
    
    # Create and start scheduler
    scheduler = CollectionScheduler(config)
    
    try:
        scheduler.start()
    except KeyboardInterrupt:
        print("\nShutting down...")
        scheduler.stop()
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
