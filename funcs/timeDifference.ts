import datetimeDifference from 'datetime-difference';

export function printTimeDiff(from: Date, comparison = new Date(), filterOut = ['milliseconds']): string {
    enum shortDates {
        years = "y",
        months = "m",
        days = "d",
        hours = "h",
        minutes = "min",
        seconds = "s"
    }

    const timeObject = datetimeDifference(from, comparison)

    const rv = Object.keys(timeObject).filter(key => timeObject[key] && !filterOut.includes(key))
        .map(key => `${timeObject[key]} ${shortDates[key]}`)
    
    if(rv.length > 1) rv.splice(rv.length - 1);
    return rv.join(" ")
}