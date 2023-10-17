(function ($) {
    "use strict";
    document.addEventListener('DOMContentLoaded', (event) => {
        // Call the function to update the chart
        updateWorldwideSalesChart();
        updateSalseRevenueChart()
    });

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // document.addEventListener('DOMContentLoaded', (event) => {
    //     // Call the function to update the chart
    //     updateWorldwideSalesChart();
    //     updateSalseRevenueChart()
    // });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav : false
    });


    // Worldwide Sales Chart
    
    // var ctx1 = $("#worldwide-sales").get(0).getContext("2d");
    // var myChart1 = new Chart(ctx1, {
    //     type: "bar",
    //     data: {
    //         labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",'Aug','Sep','Oct','Nov','Dec'],
    //         datasets: [{
    //                 label: "Salse",
    //                 data: [15, 30, 55, 65, 60, 80, 95,50,66,43,90,75],
    //                 backgroundColor: "rgba(0, 156, 255, .7)"
    //             }
             
    //         ]
    //         },
    //     options: {
    //         responsive: true
    //     }
    // });





    // -------------------------------------------------------------

    let myChart1;




    async function fetchSalesData() {
        try {
          const response = await axios.get('/admin/sales-data'); // Replace with your actual API endpoint
          if (response.status !== 200) {
            throw new Error('Failed to fetch data');
          }
          return response.data; // Assuming the data is an array
        } catch (error) {
          console.error('Error fetching sales data:', error);
          return [];
        }
    }
  
      // Update the Worldwide Sales Chart with the fetched data
      async function updateWorldwideSalesChart() {
        const salesData = await fetchSalesData();

        console.log(salesData);
  
        const ctx1 = $("#worldwide-sales").get(0).getContext("2d");
        if (myChart1) {
            myChart1.destroy();
        }
        myChart1 = new Chart(ctx1, {
          type: "bar",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
              label: "Sales",
              data: salesData, // Use the fetched data here
              backgroundColor: "rgba(0, 156, 255, .7)"
            }]
          },
          options: {
            responsive: true
          }
        });
    }
  
      // Call the function to update the chart
    updateWorldwideSalesChart();
    updateSalseRevenueChart()




    //   -----------------------------------


        // This is a sample, you should fetch this data from your API
    //     await axios.get('/admin/revenue'); // Replace with your actual API endpoint
    //     return {
    //       labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
    //       salesData: [15, 30, 55, 45, 70, 65, 85],
    //       revenueData: [99, 135, 170, 130, 190, 180, 270]
    //     };
    //   }

    let responseData;
    async function fetchSalseRevenueData() {

        try {
            const response = await axios.get('/admin/revenue'); // Replace with your actual API endpoint
            // if (!response.ok) {
            //   throw new Error('Network response was not ok');
            // }
            console.log('Total order stock for each category:', response);
            responseData = response
            return response.data;
        
            const data = await response.json();
            responseData = data
            return data
        }
        catch (error) {
            console.error('Error fetching total order prices:', error);
        }
        
    }


    //   try {
    //     const response = await axios.get('/admin/revenue'); // Replace with your actual API endpoint
    //     if (response.status !== 200) {
    //       throw new Error('Failed to fetch data');
    //     }
    //     return response.data; // Assuming the data is an array
    //   } catch (error) {
    //     console.error('Error fetching sales data:', error);
    //     return [];
    //   }

    

      async function updateSalseRevenueChart() {
        const salseRevenueData = await fetchSalseRevenueData();
        console.log(responseData);

        const ctx2 = $("#salse-revenue").get(0).getContext("2d");
        const myChart2 = new Chart(ctx2, {
          type: "line",
          data: {
                labels: responseData.data.categories,
            datasets: [
              {
                label: "stock",
                data: responseData.data.totalStocks,
                backgroundColor: "rgba(0, 156, 255, .5)",
                fill: true
              },
            //   {
            //     label: "Revenue",
            //     data: responseData.data.revenueData,
            //     backgroundColor: "rgba(0, 156, 255, .3)",
            //     fill: true
            //   }
            ]
          },
          options: {
            responsive: true
          }
        });


      updateSalseRevenueChart()
    
    }

    // ------------------------sale yearly-------------------------------------

    document.getElementById('mibtn').addEventListener('click', async () => {
        try {
            const response = await axios.get('/admin/saleyearly'); // Replace with your actual API endpoint for yearly data
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }

            const data = response.data; // Yearly data
            console.log(data);

            // Process the yearly data as needed

            const ctx1 = $("#worldwide-sales").get(0).getContext("2d");
           
            if (myChart1) {
                myChart1.destroy();
            }

            myChart1 = new Chart(ctx1, {
            type: "bar",
            data: {
                labels: ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"],
                datasets: [{
                label: "Sales",
                data: data, // Use the fetched data here
                backgroundColor: "rgba(0, 156, 255, .7)"
                }]
            },
            options: {
                responsive: true
            }
            })



            console.log('Yearly data:', data);
        } catch (error) {
            console.error('Error fetching yearly data:', error);
        }
    });



        // ------------------------sale monthly(button)-------------------------------------

        document.getElementById('highbtn').addEventListener('click', async () => {
            async function fetchSalesData() {
                try {
                  const response = await axios.get('/admin/sales-data'); // Replace with your actual API endpoint
                  if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                  }
                  return response.data; // Assuming the data is an array
                } catch (error) {
                  console.error('Error fetching sales data:', error);
                  return [];
                }
            }
          
              // Update the Worldwide Sales Chart with the fetched data
              async function updateWorldwideSalesChart() {
                const salesData = await fetchSalesData();
        
                console.log(salesData);
          
                const ctx1 = $("#worldwide-sales").get(0).getContext("2d");
                if (myChart1) {
                    myChart1.destroy();
                }
                myChart1 = new Chart(ctx1, {
                  type: "bar",
                  data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    datasets: [{
                      label: "Sales",
                      data: salesData, // Use the fetched data here
                      backgroundColor: "rgba(0, 156, 255, .7)"
                    }]
                  },
                  options: {
                    responsive: true
                  }
                });
            }
          
              // Call the function to update the chart
            updateWorldwideSalesChart();
            updateSalseRevenueChart()
           
        });







    // // Salse & Revenue Chart
    // var ctx2 = $("#salse-revenue").get(0).getContext("2d");
    // var myChart2 = new Chart(ctx2, {
    //     type: "line",
    //     data: {
    //         labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
    //         datasets: [{
    //                 label: "Salse",
    //                 data: [15, 30, 55, 45, 70, 65, 85],
    //                 backgroundColor: "rgba(0, 156, 255, .5)",
    //                 fill: true
    //             },
    //             {
    //                 label: "Revenue",
    //                 data: [99, 135, 170, 130, 190, 180, 270],
    //                 backgroundColor: "rgba(0, 156, 255, .3)",
    //                 fill: true
    //             }
    //         ]
    //         },
    //     options: {
    //         responsive: true
    //     }
    // });
    


    // Single Line Chart
    var ctx3 = $("#line-chart").get(0).getContext("2d");
    var myChart3 = new Chart(ctx3, {
        type: "line",
        data: {
            labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
            datasets: [{
                label: "Salse",
                fill: false,
                backgroundColor: "rgba(0, 156, 255, .3)",
                data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Single Bar Chart
    var ctx4 = $("#bar-chart").get(0).getContext("2d");
    var myChart4 = new Chart(ctx4, {
        type: "bar",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(0, 156, 255, .7)",
                    "rgba(0, 156, 255, .6)",
                    "rgba(0, 156, 255, .5)",
                    "rgba(0, 156, 255, .4)",
                    "rgba(0, 156, 255, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Pie Chart
    var ctx5 = $("#pie-chart").get(0).getContext("2d");
    var myChart5 = new Chart(ctx5, {
        type: "pie",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(0, 156, 255, .7)",
                    "rgba(0, 156, 255, .6)",
                    "rgba(0, 156, 255, .5)",
                    "rgba(0, 156, 255, .4)",
                    "rgba(0, 156, 255, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Doughnut Chart
    var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
    var myChart6 = new Chart(ctx6, {
        type: "doughnut",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(0, 156, 255, .7)",
                    "rgba(0, 156, 255, .6)",
                    "rgba(0, 156, 255, .5)",
                    "rgba(0, 156, 255, .4)",
                    "rgba(0, 156, 255, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });

    
})(jQuery);

