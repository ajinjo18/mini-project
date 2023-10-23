const registercollection = require('../model/registerSchema')
const productCollection = require('../model/productSchema')
const categorycollection = require('../model/categorySchema')


const sales = async (req, res) => {


  let ordersbymonth
  let orderCountsArray


  const pipeline = [
    {
      $unwind: '$orders'
    },
    {
      $project: {
        month: { $month: '$orders.date' }
      }
    },
    {
      $group: {
        _id: '$month',
        ordersCount: { $sum: 1 }
      }
    }
  ];

  registercollection.aggregate(pipeline)
    .then(result => {
      ordersbymonth = result
    })
    .catch(error => {
      console.error('Error:', error);
    });


  setTimeout(() => {
    orderCountsArray = Array(12).fill(0);

    ordersbymonth.forEach(monthData => {
      const monthIndex = monthData._id - 1;
      orderCountsArray[monthIndex] = monthData.ordersCount;
    });


    res.json(orderCountsArray);
  }, 1000);





}


const revenue = async (req, res) => {
  const getCategoryProductStocks = async () => {
    try {
      const aggregateResult = await productCollection.aggregate([
        {
          $group: {
            _id: '$category',
            totalStock: { $sum: '$stock' }
          }
        }
      ]);

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


      const data = {
        categories: categories,
        totalStocks: totalStocks,
      };
      res.json(data);
    })
    .catch((error) => console.error(error));

}



const saleyearly = async (req, res) => {
  let ordersByYear;
  let orderCountsArray = Array(8).fill(0);

  const pipeline = [
    {
      $unwind: '$orders'
    },
    {
      $project: {
        year: { $year: '$orders.date' }
      }
    },
    {
      $group: {
        _id: { year: '$year' },
        ordersCount: { $sum: 1 } 
      }
    }
  ];

  try {
    const result = await registercollection.aggregate(pipeline);

    result.forEach(data => {
      const yearIndex = data._id.year - 2023; 
      orderCountsArray[yearIndex] = data.ordersCount;
    });

    res.status(200).json(orderCountsArray);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}



module.exports = {
  sales, revenue, saleyearly
}