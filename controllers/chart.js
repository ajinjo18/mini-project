const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')
const categorycollection = require('../model/categorySchema')


const sales = async (req,res)=>{


    let ordersbymonth
    let orderCountsArray


    const pipeline = [
        {
          $unwind: '$orders' // Flatten the orders array
        },
        {
          $project: {
            month: { $month: '$orders.date' } // Extract the month from the date
          }
        },
        {
          $group: {
            _id: '$month', // Group by month
            ordersCount: { $sum: 1 } // Count the number of orders for each month
          }
        }
      ];
      
      registercollection.aggregate(pipeline)
        .then(result => {
            ordersbymonth = result
          // console.log('Orders count for each month:', result);
        })
        .catch(error => {
          console.error('Error:', error);
        });


        setTimeout(() => {
            // console.log('Accessing result after a delay:', ordersbymonth);
            orderCountsArray = Array(12).fill(0);
          
            // Iterate over the result array and update the order counts in the correct positions
            ordersbymonth.forEach(monthData => {
              const monthIndex = monthData._id - 1; // Months are 1-indexed, adjust to 0-indexed
              orderCountsArray[monthIndex] = monthData.ordersCount;
            });
            
            // console.log('Order counts for each month:', orderCountsArray);

            res.json(orderCountsArray);        
          }, 1000);



          

}


const revenue = async(req,res)=>{
    const getCategoryProductStocks = async () => {
        try {
          // Aggregate the Product collection to group by category and sum the stock
          const aggregateResult = await productCollection.aggregate([
            {
              $group: {
                _id: '$category',
                totalStock: { $sum: '$stock' }
              }
            }
          ]);
      
          // Fetch the category details for each aggregated category
          const productsByCategory = await Promise.all(
            aggregateResult.map(async (result) => {
              const category = await categorycollection.findOne({ category: result._id });
              return { category: category, totalStock: result.totalStock };
            })
          );
      
          return productsByCategory;
        } catch (error) {
          throw new Error('Error calculating total stock: ' + error.message);
        }
      };
      let categories
      let totalStocks
      getCategoryProductStocks()
        .then((productsByCategory) => {
            categories = [];
            totalStocks = [];
        
            productsByCategory.forEach((categoryProducts) => {
                categories.push(categoryProducts.category.category);
                totalStocks.push(categoryProducts.totalStock);
            });
        
            // console.log('Categories:', categories);
            // console.log('Total Stocks:', totalStocks);

            const data = {
                categories: categories,
                totalStocks: totalStocks,
            };
            console.log(data);
            res.json(data);
        })
        .catch((error) => console.error(error));
        
}



const saleyearly = async(req,res)=>{
    // console.log('innnnn');
        let ordersByYear;
        let orderCountsArray = Array(8).fill(0); // 8 years from 2023 to 2030
    
        const pipeline = [
            {
                $unwind: '$orders' // Flatten the orders array
            },
            {
                $project: {
                    year: { $year: '$orders.date' }
                }
            },
            {
                $group: {
                    _id: { year: '$year' },
                    ordersCount: { $sum: 1 } // Count the number of orders for each year
                }
            }
        ];
    
        try {
            const result = await registercollection.aggregate(pipeline);
    
            result.forEach(data => {
                const yearIndex = data._id.year - 2023; // Adjust the year to match the array index
                orderCountsArray[yearIndex] = data.ordersCount;
            });
    
            // console.log('Order counts for each year:', orderCountsArray);
            res.status(200).json(orderCountsArray);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    
}




module.exports = {
    sales,revenue,saleyearly
}