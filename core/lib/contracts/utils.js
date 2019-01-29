function Utils() {

    const PATH_SEPARATOR = '/'

    // Returns the root directory
    this.getRootDir = () => {
        return __dirname.split(PATH_SEPARATOR).slice(0, -2).join(PATH_SEPARATOR)
    }

}

module.exports = () => {
    return new Utils()
}
