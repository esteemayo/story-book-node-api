class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // filtering
        const queryStr = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(item => delete queryStr[item]);

        // advanced filtering
        let queryObj = JSON.stringify(queryStr);
        queryObj = queryObj.replace(/\b(gte|gt|lte|lt)\b/, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryObj));
        return this;
    }

    sort() {
        // sorting
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        // limiting fields
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        // pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        if (this.queryString.page) {
            this.query = this.query.skip(skip).limit(limit);
        }

        return this;
    }
}

module.exports = APIFeatures;
