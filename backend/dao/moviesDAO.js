let movies;

export default class MoviesDAO {
    static async injectDB(conn) {
        if (movies) {
        return;
        }
        //ACCESSING THE DATABASE(sample_mflix) AND COLLECTION(movies)
        try {
        movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies");
        } catch (e) {
        console.error(
            `Unable to establish a collection handle in moviesDAO: ${e}`,
        );
        }
    }
    
    static async getMovies({
        //default values for the parameters
        filters = null,
        page = 0,
        moviesPerPage = 20,
    } = {}) {
        let query;
        //can filter by title, rated, or genre
        if (filters) {
        if ("title" in filters) {
            query = { $text: { $search: filters["title"] } };
        } else if ("rated" in filters) {
            query = { "rated": { $eq: filters["rated"] } };
        } else if ("genre" in filters) {
            query = { "genre": { $eq: filters["genre"] } };
        }
        }
    
        let cursor;
        try {
        cursor = await movies
            .find(query)
            .limit(moviesPerPage)
            .skip(moviesPerPage * page);
        const moviesList = await cursor.toArray();
        const totalNumMovies = await movies.countDocuments(query);
    
        return { moviesList, totalNumMovies };
        } catch (e) {
        console.error(`Unable to issue find command, ${e}`);
        //returns array of movies and total number of movies that match the query
        return { moviesList: [], totalNumMovies: 0 };
        }
    }
    
    static async getMovieByID(id) {
        try {
        const pipeline = [
            {
            $match: {
                _id: new ObjectId(id),
            },
            },
            {
            $lookup: {
                from: "reviews",
                let: {
                id: "$_id",
                },
                pipeline: [
                {
                    $match: {
                    $expr: {
                        $eq: ["$movie_id", "$$id"],
                    },
                    },
                },
                {
                    $sort: {
                    date: -1,
                    },
                },
                ],
                as: "reviews",
            },
            },
            {
            $addFields: {
                reviews: "$reviews",
            },
            },
        ];
    
        return await movies.aggregate(pipeline).next();
        } catch (e) {
        console.error(`Something went wrong in getMovieByID: ${e}`);
        throw e;
        }
    }
    
    static async getGenres() {
        let genres = [];
    }
};