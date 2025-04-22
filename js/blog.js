let articleList = [];

$(document).ready(function() {
    $.getJSON("/articles.json", function(data) {
        if (document.readyState === "complete") {
            loadArticles(data);
        } else {
            let checkReady = setInterval(() => {
                if (document.readyState === "complete") {
                    loadArticles(data);
                    clearInterval(checkReady);
                }
            }, 50);
        }
    }).fail(function(jqxhr, textStatus, error) {
        console.error("Error loading articles:", textStatus, error);
    });
});

function loadArticles(data) {
    try {
        // Get pinned articles from cookie
        let pinnedArticles = [];
        try {
            pinnedArticles = Cookies.get("pinned-articles") 
                ? JSON.parse(Cookies.get("pinned-articles")) 
                : [];
        } catch (e) {
            console.error("Error parsing pinned articles cookie:", e);
        }

        // Store sorted articles
        articleList = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Update search placeholder
        $("#blogsearch").prop("placeholder", `Search ${data.length} articles...`);
        $("#articles").empty().remove("#loading-message");

        // Create article elements
        articleList.forEach(article => {
            if (!article.path) {
                console.warn("Article missing path:", article.slug);
                return;
            }

            const $article = $("<div>")
                .addClass("article")
                .attr("id", article.slug)
                .data("article-data", article) // Store full article data
                .append(
                    $("<img>").addClass("thumbnail")
                        .prop({ src: article.thumbnail, alt: article.title }),
                    $("<h1>").text(article.title),
                    $("<div>").addClass("excerpt").text(article.excerpt),
                    $("<div>").addClass("meta").html(`
                        <span>Posted: ${new Date(article.date).toLocaleDateString()}</span>
                        <span>Author: ${article.author}</span>
                    `),
                    $("<img>").addClass("star")
                        .prop({ src: "img/star.svg", alt: "Pin article" })
                );

            // Handle pinned state
            if (pinnedArticles.includes(article.slug)) {
                $article.find(".star").attr("src", "img/star-fill.svg");
                $("#pinned-articles").append($article.clone(true));
                $("#pinnedmessage").hide();
            }

            $("#articles").append($article);
        });

        // Search functionality
        $("#blogsearch").on("input", function() {
            const query = $(this).val().trim().toLowerCase();
            $(".article").each(function() {
                const $art = $(this);
                const text = $art.text().toLowerCase();
                const match = text.includes(query);
                $art.toggle(match);
            });
        });

        // Star click handler
        $(document).on("click", ".star", function(e) {
            e.stopPropagation();
            const $article = $(this).closest(".article");
            const slug = $article.attr("id");
            const article = articleList.find(a => a.slug === slug);
            
            if (!article) return;

            let pinned = Cookies.get("pinned-articles") 
                ? JSON.parse(Cookies.get("pinned-articles"))
                : [];

            if (pinned.includes(slug)) {
                // Remove from pinned
                pinned = pinned.filter(s => s !== slug);
                $(this).attr("src", "img/star.svg");
                $(`#pinned-articles #${slug}`).remove();
            } else {
                // Add to pinned
                pinned.push(slug);
                $(this).attr("src", "img/star-fill.svg");
                $("#pinned-articles").append($article.clone(true));
            }

            Cookies.set("pinned-articles", JSON.stringify(pinned), { 
                expires: 180,
                secure: true,
                sameSite: 'lax'
            });
            
            if ($("#pinned-articles").children().length === 0) {
                $("#pinnedmessage").show();
            }
        });

        // Article click handler
        $(document).on("click", ".article", function() {
            const article = $(this).data("article-data");
            if (article?.path) {
                window.location.href = article.path;
            } else {
                console.error("Article path missing for:", article?.slug);
            }
        });

    } catch (error) {
        console.error("Error loading articles:", error);
        $("#articles").html("<p>Error loading articles. Please try again later.</p>");
    }
}

function selectRandomArticle() {
    if (articleList.length === 0) {
        alert("No articles available!");
        return;
    }
    
    const article = articleList[Math.floor(Math.random() * articleList.length)];
    if (article?.path) {
        window.location.href = article.path;
    } else {
        console.error("Random article missing path:", article.slug);
        alert("Error selecting random article!");
    }
}