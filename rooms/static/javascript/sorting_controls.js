function create_sorting_controller() {
    let html_wrapper = $(`
    <!--Note: This html is largely based off of small-cards html - if small card gets changed, this should as well.-->
    <div class="card" style="width: 100%; margin-bottom: 5px">
        <div class="container-fluid" style="background-color: #f2f5ff">
            <div class="card-body fonted Cards_parent" style="padding: 10px;">
                <div class="row">
                    <div class="col-sm-6 padding-0">
                        <div class="container-fluid padding-0">
                            <div class="row">
                                <div align="center" class="col-sm-6 padding-0">
                                    <p class="card-text">
                                        Building
                                    </p>
                                </div>
                                <div class="col-sm-3 padding-0">
                                    <p class="card-text">
                                        Floor
                                    </p>
                                </div>
                                <div class="col-sm-3 padding-0">
                                    <p class="card-text">
                                        Sqft
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 padding-0">
                        <div class="container-fluid padding-0">
                            <div class="row">
                                <div class="col-sm-3 padding-0">
                                    <p class="card-text">
                                        Numroom
                                    </p>
                                </div>
                                <div class="col-sm-3 padding-0">
                                    <p class="card-text">
                                        College
                                    </p>
                                </div>
                                <div class="col-sm-2 padding-0">
                                    <p class="card-text">
                                        Favorites
                                    </p>
                                </div>
                                <div align="center" class="col-sm-4">
        
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`);

    return html_wrapper;
}

