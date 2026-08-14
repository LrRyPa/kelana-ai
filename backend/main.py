from services.trip_service import (
    get_trip_category,
    get_travel_season,
    calculate_daily_budget,
    get_recommended_places
)

def print_trip_summary(destination, country, days, budget, currency, travel_month):
    category = get_trip_category(budget)
    season = get_travel_season(travel_month)
    daily_budget = calculate_daily_budget(budget, days)
    places = get_recommended_places(destination)

    print("\n==================================")
    print("             KelanaAI             ")
    print("==================================")
    print(f"Destination    : {destination}")
    print(f"Country        : {country}")
    print(f"Days           : {days} Hari")
    print(f"Budget         : {budget:.0f} {currency}")
    print(f"Daily Budget   : {daily_budget:.2f} {currency}/hari")
    print(f"Category       : {category}")
    print(f"Season         : {season}")
    print("==================================")

    print("\nRecommended Places: ")
    for idx, place in enumerate(places, start=1):
        print(f"  {idx}. {place}")
    print("==================================\n")

def main():
    print("Selamat datang di KelanaAI! Mari rencanakan perjalanan Anda.\n")

    destination  = input("Masukkan destinasi       : ")
    country      = input("Masukkan negara          : ")
    days         = int(input("Masukkan jumlah hari     : "))
    budget       = float(input("Masukkan budget          : "))
    currency     = input("Masukkan mata uang       : ")
    travel_month = input("Masukkan bulan perjalanan: ")

    print_trip_summary(destination, country, days, budget, currency, travel_month)

if __name__ == "__main__":
    main()
