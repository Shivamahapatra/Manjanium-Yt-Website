import asyncio
from main import get_combined_matches

async def main():
    res = await get_combined_matches("20260710")
    # print(res)  # we only care about the debug prints

if __name__ == "__main__":
    asyncio.run(main())
