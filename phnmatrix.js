function PHNMatrix(array_or_options) {

    // array_or_options = { row_length: 10, col_length: 10, placement: null }
    // array_or_options = []

    const
        basic_functions = {
            between_number: (number, a, b) => {
                let min = Math.min.apply(Math, [a, b]),
                    max = Math.max.apply(Math, [a, b]);
                return number >= min && number <= max;
            },

            length: matrix => {
                return {
                    //matrix: matrix,
                    row: matrix.length,
                    col: matrix[0].length,
                    elm: matrix.length * matrix[0].length
                }
            },

            get: (matrix, row_index = null, col_index = null) => {
                if (row_index == null && col_index == null) return matrix;
                else if (row_index != null && col_index == null) return matrix[row_index];
                else if (row_index == null && col_index != null) {
                    let return_result = [];
                    matrix.forEach(row => return_result.push(row[col_index]));
                    return return_result;
                }
                else if (row_index != null && col_index != null) return matrix[row_index][col_index];
            },

            get_fromto: (matrix, from_row = 0, to_row = 0, from_col = 0, to_col = 0) => {
                let return_result = [];
                for (let r = 0; r < matrix.length; r++) {
                    let row = [];
                    for (let c = 0; c < matrix[r].length; c++)
                        if (basic_functions.between_number(r, from_row, to_row) && basic_functions.between_number(c, from_col, to_col))
                            row.push(matrix[r][c]);
                    if (row.length != 0)
                        return_result.push(row);
                }
                return return_result;
            },

            set: (matrix, row_index = null, col_index = null, value) => {
                if (row_index == null && col_index == null)
                    for (let r = 0; r < matrix.length; r++)
                        for (let c = 0; c < matrix[r].length; c++)
                            matrix[r][c] = basic_functions.set_value(value, r, c, matrix[r][c]);
                else if (row_index != null && col_index == null)
                    for (let c = 0; c < matrix[row_index].length; c++)
                        matrix[row_index][c] = basic_functions.set_value(value, row_index, c, matrix[row_index][c]);
                else if (row_index == null && col_index != null)
                    for (let r = 0; r < matrix.length; r++)
                        matrix[r][col_index] = basic_functions.set_value(value, r, col_index, matrix[r][col_index]);
                else if (row_index != null && col_index != null) matrix[row_index][col_index] = basic_functions.set_value(value, row_index, col_index, matrix[row_index][col_index]);
                return matrix;
            },

            set_fromto: (matrix, from_row = 0, to_row = 0, from_col = 0, to_col = 0, value) => {
                for (let r = 0; r < matrix.length; r++)
                    for (let c = 0; c < matrix[r].length; c++)
                        if (basic_functions.between_number(r, from_row, to_row) && basic_functions.between_number(c, from_col, to_col))
                            matrix[r][c] = basic_functions.set_value(value, r, c, matrix[r][c]);
                return matrix;
            },

            set_value: (new_value, r, c, current_value) => {
                let return_result = new_value;
                if (typeof new_value == "function")
                    return_result = new_value(new_value, r, c, current_value);
                return return_result;
            },

            split_param: param => {
                let params = param.split(/[\s~]+/);
                params.forEach((param, index) => {
                    if (param == "*") params[index] = null;
                    else params[index] = parseInt(params[index]);
                });
                return params;
            },

            create_matrix: (row_length, col_length, placement) => {
                let matrix = [];
                if (row_length != undefined && col_length != undefined)
                    for (let r = 0; r < row_length; r++) {
                        let row = [];
                        for (let c = 0; c < col_length; c++)
                            row.push(placement);
                        matrix.push(row);
                    }
                return matrix;
            },

            /* set_newvalue_forevery: (matrix, callback) => {
                for (let r = 0; r < matrix["* *"].length; r++)
                    for (let c = 0; c < matrix[r + " *"].length; c++)
                        matrix[r + " " + c] = callback(r, c, matrix[r + " " + c]);
                return matrix;
            },

            multiply_matrix: (a, b) => {
                // https://stackoverflow.com/a/27205341/16319071
                var aNumRows = a.length, aNumCols = a[0].length,
                    bNumRows = b.length, bNumCols = b[0].length,
                    m = new Array(aNumRows);
                for (var r = 0; r < aNumRows; ++r) {
                    m[r] = new Array(bNumCols);
                    for (var c = 0; c < bNumCols; ++c) {
                        m[r][c] = 0;
                        for (var i = 0; i < aNumCols; ++i) {
                            m[r][c] += a[r][i] * b[i][c];
                        }
                    }
                }
                return m;
            },

            inverse_matrix: (A) => {
                // https://gist.github.com/husa/5652439
                var temp,
                    N = A.length,
                    E = [];

                for (var i = 0; i < N; i++)
                    E[i] = [];

                for (i = 0; i < N; i++)
                    for (var j = 0; j < N; j++) {
                        E[i][j] = 0;
                        if (i == j)
                            E[i][j] = 1;
                    }

                for (var k = 0; k < N; k++) {
                    temp = A[k][k];

                    console.table(A);

                    for (var j = 0; j < N; j++) {
                        A[k][j] /= temp;
                        E[k][j] /= temp;
                    }

                    for (var i = k + 1; i < N; i++) {
                        temp = A[i][k];

                        for (var j = 0; j < N; j++) {
                            A[i][j] -= A[k][j] * temp;
                            E[i][j] -= E[k][j] * temp;
                        }
                    }
                }

                for (var k = N - 1; k > 0; k--) {
                    for (var i = k - 1; i >= 0; i--) {
                        temp = A[i][k];

                        for (var j = 0; j < N; j++) {
                            A[i][j] -= A[k][j] * temp;
                            E[i][j] -= E[k][j] * temp;
                        }
                    }
                }

                for (var i = 0; i < N; i++)
                    for (var j = 0; j < N; j++)
                        A[i][j] = E[i][j];
                return A;
            } */
        },

        /* math_functions = {
            plus_matrix: (matrix, another_matrix) => basic_functions.set_newvalue_forevery(matrix, (r, c, value) => value + another_matrix[r + " " + c]),
            minus_matrix: (matrix, another_matrix) => basic_functions.set_newvalue_forevery(matrix, (r, c, value) => value - another_matrix[r + " " + c]),
            times_matrix: (matrix, another_matrix, parse_to_phnmatrix = false) => {
                let return_result = basic_functions.multiply_matrix(matrix["* *"], another_matrix["* *"]);
                if (parse_to_phnmatrix) return_result = PHNMatrix(return_result);
                return return_result;
            },

            plus_number: (matrix, number) => basic_functions.set_newvalue_forevery(matrix, (r, c, value) => value + number),
            minus_number: (matrix, number) => basic_functions.set_newvalue_forevery(matrix, (r, c, value) => value - number),
            times_number: (matrix, number) => basic_functions.set_newvalue_forevery(matrix, (r, c, value) => value * number),
            divide_number: (matrix, number) => basic_functions.set_newvalue_forevery(matrix, (r, c, value) => value / number),

            times_vector: (matrix, vector) => {
                vector.forEach((value, index) => vector[index] = [value]);
                vector = PHNMatrix(vector);

                let return_result = math_functions.times_matrix(matrix, vector);
                return_result = return_result.flat();
                return PHNMatrix(return_result);
            }
        }, */

        handler = {
            // ["length"]
            // ["5 2"] ["-1 4"]
            // ["1~2 4~5"]
            // ["* 1"]

            // (*) PHNMatrix.plus(matrix/vector/number)
            // (*) PHNMatrix.minus / times / divide
            // (*) vector "must" be a normal array (e.g: [1, 2, 3])

            get: (matrix, param) => {
                if (param == "length")
                    return basic_functions.length(matrix);
                /* else if (param == "inverse")
                    return PHNMatrix(basic_functions.inverse_matrix(matrix));
                else if (["plus", "minus", "times", "divide"].includes(param))
                    return (other_obj) => {
                        let typeof_other_obj = (
                            typeof other_obj == "number" ? "number" : (
                                other_obj["* *"] == undefined ? "vector" : "matrix"
                            )
                        );
                        return math_functions[param + "_" + typeof_other_obj](PHNMatrix(matrix), other_obj);
                    }; */

                let params = basic_functions.split_param(param);
                if (params.length == 2)
                    return basic_functions.get(matrix, params[0], params[1]);
                else if (params.length == 4)
                    return basic_functions.get_fromto(matrix, params[0], params[1], params[2], params[3]);
            },

            set: (matrix, param, value) => {
                let params = basic_functions.split_param(param);

                if (params.length == 2)
                    basic_functions.set(matrix, params[0], params[1], value);
                else if (params.length == 4)
                    basic_functions.set_fromto(matrix, params[0], params[1], params[2], params[3], value);

                return true;
            }
        };

    let array = array_or_options;
    if (array_or_options == undefined)
        array = [];
    else if (array_or_options.row_length != undefined && array_or_options.col_length != undefined)
        array = basic_functions.create_matrix(array_or_options.row_length, array_or_options.col_length, array_or_options.placement);

    return new Proxy(array, handler);
}