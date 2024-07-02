// Paste your chart configuration and data setup code here
const today = new Date();
const labels = [];
for (let i = 11; i >= 0; --i) {
    let day = new Date(today);
    day.setDate(today.getDate() - i);
    labels.push(day.getDate().toString());
}


const datapoints_usd_buy = [22150, 22100, 22200, 22100, 22100, 22150, 22250, 22200, 22200, 22200, 22100, 22150, 22150];
const datapoints_usd_sell = [22400, 22300, 22400, 22400, 22300, 22400, 22500, 22400, 22500, 22450, 22300, 22400, 22400];

const datapoints_euro_buy = [23800, 23900, 23950, 24050, 24000, 23900, 23800, 23700, 23800, 23850, 23800, 23800, 23850];
const datapoints_euro_sell = [24000, 24100, 24100, 24200, 24200, 24100, 24000, 23900, 24000, 24050, 24000, 24000, 24050];

const data = {
    labels: labels,
    datasets: [
        {
            label: 'USD buy price',
            data: datapoints_usd_buy,
            borderColor: 'red',
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
        }, {
            label: 'USD sell price',
            data: datapoints_usd_sell,
            borderColor: 'green',
            fill: false,
            tension: 0.4
        }, {
            label: 'EUR buy price',
            data: datapoints_euro_buy,
            borderColor: 'blue',
            fill: false,
            tension: 0.4
        }, {
            label: 'EUR sell price',
            data: datapoints_euro_sell,
            borderColor: 'pink',
            fill: false,
            tension: 0.4
        }
    ]
};

const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'USD EURO DZD',
                color: 'white'
            },
            legend: {
                labels: {
                    color: 'white'
                }
            }
        },
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'days - jour',
                    color: 'white'
                },
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'white'
                }
            },
            y: {
                display: true,
                title: {
                    display: false,
                    text: 'Value'
                },
                suggestedMin: 21000,
                suggestedMax: 25000,
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'white'
                }
            }
        },
        
    },
};

// Render the chart on canvas with id 'myChart'
const ctx = document.getElementById('myChart').getContext('2d');
new Chart(ctx, config);