def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print("\n========================")
    print("       KelanaAI         ")
    print("========================")
    print(f"Destination  : {destination}")
    print(f"Country      : {country}")
    print(f"Days         : {days}")
    print(f"Budget       : {budget:.0f} {currency}")
    print(f"Currency     : {currency}")
    print(f"Travel Month : {travel_month}")
    print("========================")


def main():
    print("Selamat datang di KelanaAI! Mari rencanakan perjalanan Anda.\n")

    destination  = input("Masukkan destinasi       : ")
    country      = input("Masukkan negara          : ")
    days         = int(input("Masukkan jumlah hari     : "))
    budget       = float(input("Masukkan budget          : "))
    currency     = input("Masukkan mata uang       : ")
    travel_month = input("Masukkan bulan perjalanan: ")

    print()
    print_trip_summary(destination, country, days, budget, currency, travel_month)


if __name__ == "__main__":
    main()
