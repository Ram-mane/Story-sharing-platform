import React, { useEffect, useState } from "react";

import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { database } from "./Story";

import { List } from "./Story";
import "./LatestStories.css";
import { Card } from "reactstrap";

const LatestStories = () => {
  const [popularCat, setPopularCat] = useState([]);
  const [popularCatDetails, setPopularCatDetails] = useState([]);
  const [clickedCatDesc, setClickedCatDesc] = useState([]);
  const [randomCatDesc, setRandomCatDesc] = useState([]);
  const [catClicked, setCatClicked] = useState(false);

  useEffect(() => {
    const popularCat = async () => {
      try {
        const snapshot = await get(ref(database, `List`));
        if (snapshot.exists()) {
          const categoryData = snapshot.val();
          const categoryArray = Object.entries(categoryData);

          // Sort categories by number of stories in descending order
          categoryArray.sort(
            ([, a], [, b]) => Object.keys(b).length - Object.keys(a).length
          );

          // Extract the names of the first 10 categories
          const top10Categories = categoryArray
            .slice(0, 10)
            .map(([categoryName]) => categoryName);

          console.log("Top 10 Categories:", top10Categories);

          // Set the state or perform any further actions with the top 10 categories
          setPopularCat(top10Categories);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };

    popularCat();
  }, []);

  const categoryDetails = async (category) => {
    try {
      const snapshot = await get(
        ref(database, `List/${category?.toUpperCase()}`)
      );

      if (snapshot.exists()) {
        const noOfStories = Object.entries(snapshot.val());
        return noOfStories;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchCatDetails = async () => {
      const catDetails = await Promise.all(
        popularCat.map((cat) => categoryDetails(cat))
      );
      setPopularCatDetails(catDetails);
    };

    fetchCatDetails();
    getRandomDescription();
  }, []);

  const getRandomDescription = async() => {
    try {
        const catD = await categoryDetails('ENGINEERING');
        const descriptions = catD.map((item) => item[1].description);
        setRandomCatDesc(descriptions);
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    
  };

  const handleCatClick = async (cat) => {
    console.log("Category clicked", cat);
    try {
      const catD = await categoryDetails(cat);
      const descriptions = catD.map((item) => item[1].description);
      setClickedCatDesc(descriptions);
      setCatClicked(true);
    } catch (error) {
      console.error("Error fetching category details:", error);
    }
  }; 

  return (
    <div className="container-latest">
      <div className="latest-stories">
        <h3>Top Searches</h3>
        {popularCat.map((cat, index) => (
          <div className="cat-name" key={index}>
            <span onClick={() => handleCatClick(cat)}>{cat}</span>
          </div>
        ))}
      </div>

      <div className="latest-stories-container">
        <h4>Trending Stories On Sysu</h4>
        {catClicked ? (
          clickedCatDesc.map((desc, index) => (
            <div className="story-container" key={index}>
              {desc}
            </div>
          ))
        ) : (
            randomCatDesc.map((desc, index) => (
                <div className="story-container" key={index}>
                  {desc}
                </div>
              ))
        )}
      </div>
    </div>
  );
};

export default LatestStories;
